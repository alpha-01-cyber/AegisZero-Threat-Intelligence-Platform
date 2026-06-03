# Mohid Umer, M Ahsan, M Saim
# 23i-2130, 23i-2117, 23i-2119
# mitre_route.py

"""MITRE ATT&CK Mapping Routes with Real API Integration"""
from flask import Blueprint, request, jsonify
import requests
import re
from datetime import datetime

mitre_bp = Blueprint('mitre', __name__, url_prefix='/api/v1/mitre')

# MITRE ATT&CK API endpoints
MITRE_API_BASE = "https://attack.mitre.org/api"
MITRE_STIX_URL = "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json"

# Cache for MITRE data to avoid repeated API calls
mitre_cache = {
    'techniques': None,
    'last_updated': None
}

def fetch_mitre_techniques():
    """Fetch MITRE techniques from the official STIX data"""
    try:
        # Check cache first (cache for 1 hour)
        if (mitre_cache['techniques'] and 
            mitre_cache['last_updated'] and 
            (datetime.now() - mitre_cache['last_updated']).total_seconds() < 3600):
            return mitre_cache['techniques']
        
        print("Fetching MITRE ATT&CK data from GitHub...")
        response = requests.get(MITRE_STIX_URL, timeout=30)
        response.raise_for_status()
        
        stix_data = response.json()
        techniques = {}
        
        for obj in stix_data.get('objects', []):
            if obj.get('type') == 'attack-pattern' and 'external_references' in obj:
                # Find the MITRE ATT&CK ID
                mitre_id = None
                for ref in obj['external_references']:
                    if ref.get('source_name') == 'mitre-attack':
                        mitre_id = ref.get('external_id')
                        break
                
                if mitre_id and mitre_id.startswith('T'):
                    techniques[mitre_id] = {
                        'id': mitre_id,
                        'name': obj.get('name', ''),
                        'description': obj.get('description', ''),
                        'tactics': [phase.get('phase_name', '') for phase in obj.get('kill_chain_phases', [])],
                        'platforms': obj.get('x_mitre_platforms', []),
                        'data_sources': obj.get('x_mitre_data_sources', []),
                        'permissions_required': obj.get('x_mitre_permissions_required', []),
                        'defense_bypassed': obj.get('x_mitre_defense_bypassed', []),
                        'url': f"https://attack.mitre.org/techniques/{mitre_id.replace('.', '/')}/"
                    }
        
        # Update cache
        mitre_cache['techniques'] = techniques
        mitre_cache['last_updated'] = datetime.now()
        
        print(f"Loaded {len(techniques)} MITRE techniques")
        return techniques
        
    except Exception as e:
        print(f"Error fetching MITRE data: {e}")
        # Return fallback empty dict if API fails
        return {}

def search_mitre_techniques(query):
    """Search MITRE techniques by name, description, or ID"""
    try:
        techniques = fetch_mitre_techniques()
        results = []
        query_lower = query.lower()
        
        for tech_id, tech_data in techniques.items():
            if (query_lower in tech_data['name'].lower() or 
                query_lower in tech_data['description'].lower() or 
                query_lower in tech_id.lower()):
                results.append(tech_data)
        
        return results[:10]  # Return top 10 results
        
    except Exception as e:
        print(f"Error searching MITRE techniques: {e}")
        return []

def get_technique_by_id(technique_id):
    """Get specific technique by ID"""
    try:
        techniques = fetch_mitre_techniques()
        return techniques.get(technique_id)
    except Exception as e:
        print(f"Error getting technique {technique_id}: {e}")
        return None

@mitre_bp.route('/techniques', methods=['GET'])
def get_all_techniques():
    """Get all MITRE ATT&CK techniques from real API"""
    try:
        techniques = fetch_mitre_techniques()
        
        if not techniques:
            return jsonify({
                'status': 'error', 
                'message': 'Failed to fetch MITRE techniques from API'
            }), 500
        
        return jsonify({
            'techniques': list(techniques.values()),
            'count': len(techniques),
            'source': 'MITRE ATT&CK STIX Data',
            'last_updated': mitre_cache['last_updated'].isoformat() if mitre_cache['last_updated'] else None
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@mitre_bp.route('/test', methods=['GET'])
def test_mapping():
    """Test endpoint to verify technique mapping"""
    try:
        # Test fetching specific techniques
        test_ids = ['T1071', 'T1595', 'T1046', 'T1059', 'T1055']
        results = {}
        
        for tech_id in test_ids:
            technique = get_technique_by_id(tech_id)
            results[tech_id] = technique['name'] if technique else 'NOT FOUND'
        
        return jsonify({
            'status': 'success',
            'test_results': results,
            'cache_loaded': mitre_cache['techniques'] is not None,
            'technique_count': len(mitre_cache['techniques']) if mitre_cache['techniques'] else 0
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@mitre_bp.route('/techniques/<technique_id>', methods=['GET'])
def get_technique(technique_id):
    """Get specific MITRE technique by ID"""
    try:
        technique = get_technique_by_id(technique_id.upper())
        
        if not technique:
            return jsonify({
                'status': 'error', 
                'message': f'Technique {technique_id} not found'
            }), 404
        
        return jsonify({'technique': technique})
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@mitre_bp.route('/search', methods=['GET'])
def search_techniques():
    """Search MITRE techniques"""
    try:
        query = request.args.get('q', '')
        
        if not query or len(query) < 2:
            return jsonify({
                'status': 'error', 
                'message': 'Search query must be at least 2 characters'
            }), 400
        
        results = search_mitre_techniques(query)
        
        return jsonify({
            'query': query,
            'results': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@mitre_bp.route('/map', methods=['POST'])
def map_ioc_to_mitre():
    """Map an IOC to relevant MITRE ATT&CK techniques using direct ID mapping"""
    try:
        data = request.json
        ioc = data.get('ioc')
        ioc_type = data.get('type', 'unknown')
        
        if not ioc:
            return jsonify({'status': 'error', 'message': 'IOC parameter required'}), 400
        
        print(f"[MITRE] Mapping {ioc_type} '{ioc}'")
        
        # Direct technique ID mapping with VERIFIED IDs from STIX data
        technique_mappings = {
            'ip': ['T1071', 'T1595', 'T1046', 'T1090', 'T1571', 'T1205'],
            'domain': ['T1071', 'T1568', 'T1583', 'T1048', 'T1102', 'T1566'],
            'url': ['T1204', 'T1189', 'T1105', 'T1059', 'T1027', 'T1566'],
            'hash': ['T1059', 'T1055', 'T1027', 'T1486', 'T1053', 'T1543'],
            'email': ['T1566', 'T1598', 'T1114', 'T1087', 'T1078', 'T1586'],
            'unknown': ['T1071', 'T1059', 'T1027', 'T1053', 'T1055', 'T1105']
        }
        
        # Get technique IDs for this IOC type
        technique_ids = technique_mappings.get(ioc_type, technique_mappings['unknown'])
        
        # Fetch full technique details
        mapped_techniques = []
        for tech_id in technique_ids:
            technique = get_technique_by_id(tech_id)
            if technique:
                mapped_techniques.append(technique)
                print(f"[MITRE] Added {tech_id}: {technique['name']}")
        
        print(f"[MITRE] Total techniques: {len(mapped_techniques)}")
        
        # Generate risk assessment
        risk_score = _calculate_risk_score(mapped_techniques, ioc_type)
        detection_rate = _calculate_detection_rate(mapped_techniques)
        
        return jsonify({
            'ioc': ioc,
            'type': ioc_type,
            'techniques': mapped_techniques,
            'risk_score': risk_score,
            'detection_rate': detection_rate,
            'mitigations': _generate_mitigations(mapped_techniques),
            'kill_chain_phases': _extract_kill_chain_phases(mapped_techniques),
            'references': [t['url'] for t in mapped_techniques[:3]]
        })
        
    except Exception as e:
        print(f"[MITRE] Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@mitre_bp.route('/generate-report', methods=['POST'])
def generate_mitre_report():
    """Generate a comprehensive MITRE ATT&CK report for an IOC using real data"""
    try:
        data = request.json
        ioc = data.get('ioc')
        ioc_type = data.get('type', 'unknown')
        
        if not ioc:
            return jsonify({'status': 'error', 'message': 'IOC parameter required'}), 400
        
        # Map to techniques using real API
        map_response = map_ioc_to_mitre()
        if map_response.status_code != 200:
            return map_response
            
        map_data = map_response.get_json()
        
        # Generate comprehensive report with real data
        report = {
            'title': f'MITRE ATT&CK Analysis Report - {ioc}',
            'generated_at': datetime.utcnow().isoformat(),
            'ioc': ioc,
            'ioc_type': ioc_type,
            'executive_summary': _generate_executive_summary(ioc, ioc_type, map_data),
            'risk_assessment': {
                'overall_risk': map_data['risk_score'],
                'detection_confidence': map_data['detection_rate'],
                'severity': 'Critical' if map_data['risk_score'] >= 80 else 'High' if map_data['risk_score'] >= 60 else 'Medium'
            },
            'techniques': map_data['techniques'],
            'attack_flow': _generate_attack_flow(map_data['techniques']),
            'recommended_actions': _generate_recommendations(map_data['techniques']),
            'mitigations': map_data['mitigations'],
            'detection_rules': _generate_detection_rules(ioc, ioc_type),
            'references': map_data['references'],
            'data_sources': _extract_data_sources(map_data['techniques'])
        }
        
        return jsonify(report)
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

def _generate_search_queries(ioc, ioc_type):
    """Generate intelligent search queries based on IOC type and characteristics"""
    queries = []
    
    if ioc_type == 'ip':
        # Prioritize C2, scanning, and network-based techniques
        queries.extend(['command control', 'remote access', 'network scanning', 
                       'brute force', 'exploitation', 'lateral movement'])
    elif ioc_type == 'domain':
        # Diverse domain-based techniques
        queries.extend(['DNS tunneling', 'domain generation', 'web protocols',
                       'credential access', 'data staging', 'exfiltration'])
    elif ioc_type == 'url':
        # URL-specific techniques (not just phishing)
        queries.extend(['drive-by compromise', 'watering hole', 'ingress tool transfer',
                       'web service', 'application layer protocol', 'user execution'])
    elif ioc_type == 'hash':
        # Malware-focused techniques
        queries.extend(['process injection', 'code execution', 'obfuscation',
                       'ransomware', 'data encrypted', 'system binary proxy'])
    elif ioc_type == 'email':
        # Email-specific (varied, not just phishing)
        queries.extend(['social engineering', 'attachment', 'email collection',
                       'account manipulation', 'valid accounts', 'spearphishing'])
    else:
        # Generic fallback
        queries.extend(['execution', 'persistence', 'privilege escalation',
                       'defense evasion', 'credential access', 'discovery'])
    
    return queries[:6]  # Limit to 6 most relevant queries

def _get_fallback_techniques(ioc_type):
    """Get fallback techniques when search returns no results"""
    fallbacks = {
        'ip': ['T1071', 'T1595', 'T1105', 'T1046', 'T1090', 'T1571'],
        'domain': ['T1071', 'T1568', 'T1583', 'T1566', 'T1048', 'T1102'],
        'url': ['T1204', 'T1189', 'T1105', 'T1566', 'T1059', 'T1027'],
        'hash': ['T1059', 'T1027', 'T1486', 'T1055', 'T1053', 'T1543'],
        'email': ['T1566', 'T1598', 'T1114', 'T1087', 'T1078', 'T1586']
    }
    
    technique_ids = fallbacks.get(ioc_type, ['T1059', 'T1566', 'T1071', 'T1027', 'T1053', 'T1055'])
    techniques = []
    
    for tech_id in technique_ids:
        technique = get_technique_by_id(tech_id)
        if technique:
            techniques.append(technique)
    
    print(f"[MITRE] Using {len(techniques)} fallback techniques for {ioc_type}")
    return techniques

def _calculate_risk_score(techniques, ioc_type):
    """Calculate risk score based on techniques and IOC type"""
    base_score = 50
    
    # Score based on number of techniques
    base_score += min(len(techniques) * 5, 30)
    
    # Score based on technique tactics (higher risk for execution/persistence)
    high_risk_tactics = ['execution', 'persistence', 'privilege-escalation', 'defense-evasion']
    for technique in techniques:
        for tactic in technique.get('tactics', []):
            if tactic.lower() in high_risk_tactics:
                base_score += 3
    
    # Score based on IOC type
    type_scores = {'ip': 5, 'domain': 8, 'url': 10, 'hash': 7, 'email': 12}
    base_score += type_scores.get(ioc_type, 0)
    
    return min(max(base_score, 0), 100)

def _calculate_detection_rate(techniques):
    """Calculate detection rate based on techniques"""
    if not techniques:
        return 50
    
    # Techniques with clear data sources are easier to detect
    detectable_count = sum(1 for t in techniques if t.get('data_sources'))
    rate = (detectable_count / len(techniques)) * 80 + 20  # Base 20% + up to 80%
    
    return min(max(int(rate), 20), 95)

def _generate_mitigations(techniques):
    """Generate mitigation strategies from techniques"""
    mitigations = set()
    
    # Common mitigations mapped to techniques
    mitigation_map = {
        'execution': 'Application whitelisting, Restrict command line interpreters',
        'persistence': 'Privileged account management, Audit account usage',
        'privilege-escalation': 'User account control, Privilege separation',
        'defense-evasion': 'Antivirus, EDR solutions, Process monitoring',
        'credential-access': 'Multi-factor authentication, Credential monitoring',
        'discovery': 'Network segmentation, System activity monitoring',
        'lateral-movement': 'Network segmentation, Restrict service permissions',
        'command-and-control': 'Network intrusion detection, Web proxy filtering',
        'exfiltration': 'Data loss prevention, Network traffic monitoring',
        'impact': 'Data backup, Business continuity planning'
    }
    
    for technique in techniques:
        for tactic in technique.get('tactics', []):
            if tactic.lower() in mitigation_map:
                mitigations.add(mitigation_map[tactic.lower()])
    
    return list(mitigations)[:6]  # Return top 6 mitigations

def _extract_kill_chain_phases(techniques):
    """Extract kill chain phases from techniques"""
    phases = set()
    for technique in techniques:
        for tactic in technique.get('tactics', []):
            phases.add(tactic.replace('-', ' ').title())
    return list(phases)

def _generate_executive_summary(ioc, ioc_type, map_data):
    """Generate executive summary based on analysis"""
    risk_level = "Critical" if map_data['risk_score'] >= 80 else "High" if map_data['risk_score'] >= 60 else "Medium"
    
    return f"""This {ioc_type.upper()} ({ioc}) has been mapped to {len(map_data['techniques'])} MITRE ATT&CK techniques 
    with an overall risk score of {map_data['risk_score']}% ({risk_level} severity). The techniques span 
    {len(map_data['kill_chain_phases'])} phases of the attack lifecycle, indicating a sophisticated threat profile 
    that requires immediate attention and comprehensive defensive measures."""

def _generate_attack_flow(techniques):
    """Generate attack flow diagram data"""
    # Group techniques by tactic for logical flow
    tactics_order = ['reconnaissance', 'resource-development', 'initial-access', 'execution', 
                    'persistence', 'privilege-escalation', 'defense-evasion', 'credential-access',
                    'discovery', 'lateral-movement', 'collection', 'command-and-control', 
                    'exfiltration', 'impact']
    
    flow = []
    for tactic in tactics_order:
        tactic_techniques = [t for t in techniques if tactic in [tac.lower() for tac in t.get('tactics', [])]]
        for technique in tactic_techniques:
            flow.append({
                'phase': tactic.replace('-', ' ').title(),
                'technique': technique['name'],
                'technique_id': technique['id']
            })
    
    return flow

def _generate_recommendations(techniques):
    """Generate actionable recommendations"""
    recommendations = [
        'Implement network monitoring for suspicious traffic patterns',
        'Enable multi-factor authentication on all critical accounts',
        'Deploy endpoint detection and response (EDR) solutions',
        'Conduct regular security awareness training',
        'Maintain up-to-date security patches',
        'Implement principle of least privilege',
        'Enable comprehensive logging and monitoring',
        'Establish incident response procedures',
        'Segment network to limit lateral movement',
        'Monitor for unusual authentication attempts'
    ]
    return recommendations[:6]

def _generate_detection_rules(ioc, ioc_type):
    """Generate detection rules for the IOC"""
    rules = []
    
    if ioc_type == 'ip':
        rules.extend([
            {
                'type': 'Network',
                'rule': f'alert ip any any -> {ioc} any (msg:"Connection to suspicious IP"; sid:1000001;)',
                'platform': 'Snort/Suricata'
            },
            {
                'type': 'Firewall',
                'rule': f'Block all traffic to/from {ioc}',
                'platform': 'Firewall/IPS'
            }
        ])
    elif ioc_type == 'domain':
        rules.extend([
            {
                'type': 'DNS',
                'rule': f'Block DNS queries for {ioc}',
                'platform': 'DNS Firewall'
            },
            {
                'type': 'Proxy',
                'rule': f'Block HTTP/HTTPS requests to {ioc}',
                'platform': 'Web Proxy'
            }
        ])
    elif ioc_type == 'hash':
        rules.append({
            'type': 'Endpoint',
            'rule': f'Block execution of file with hash {ioc}',
            'platform': 'EDR/Antivirus'
        })
    
    return rules

def _extract_data_sources(techniques):
    """Extract unique data sources from techniques"""
    data_sources = set()
    for technique in techniques:
        for source in technique.get('data_sources', []):
            data_sources.add(source)
    return list(data_sources)[:10]  # Return top 10 data sources

@mitre_bp.route('/refresh-cache', methods=['POST'])
def refresh_cache():
    """Force refresh the MITRE data cache"""
    try:
        mitre_cache['techniques'] = None
        mitre_cache['last_updated'] = None
        fetch_mitre_techniques()  # This will repopulate the cache
        
        return jsonify({
            'status': 'success',
            'message': 'MITRE cache refreshed successfully',
            'techniques_loaded': len(mitre_cache['techniques']) if mitre_cache['techniques'] else 0
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
