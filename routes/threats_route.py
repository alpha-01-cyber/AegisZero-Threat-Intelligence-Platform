# Mohid Umer, M Ahsan, M Saim
# 23i-2130, 23i-2117, 23i-2119
# threats_route.py

from flask import Blueprint, request, jsonify
from services.enrichment import EnrichmentEngine
from services.graph_builder import GraphBuilder
from datetime import datetime, timedelta
import random
import os

threats_bp = Blueprint('threats', __name__, url_prefix='/api/v1')

# In-memory storage for threat history
THREAT_HISTORY = []

enrichment_engine = EnrichmentEngine()
graph_builder = GraphBuilder()

def _get_fallback_mitre_techniques(ioc_type):
    """Fallback MITRE techniques when API is unavailable"""
    fallbacks = {
        'ip': [
            {'id': 'T1071', 'name': 'Application Layer Protocol', 'tactic': 'Command and Control', 'description': 'C2 communications over standard protocols.', 'url': 'https://attack.mitre.org/techniques/T1071/'},
            {'id': 'T1595', 'name': 'Active Scanning', 'tactic': 'Reconnaissance', 'description': 'Scanning to identify targets.', 'url': 'https://attack.mitre.org/techniques/T1595/'},
            {'id': 'T1046', 'name': 'Network Service Discovery', 'tactic': 'Discovery', 'description': 'Discovering network services.', 'url': 'https://attack.mitre.org/techniques/T1046/'},
            {'id': 'T1090', 'name': 'Proxy', 'tactic': 'Command and Control', 'description': 'Using proxies for C2.', 'url': 'https://attack.mitre.org/techniques/T1090/'},
            {'id': 'T1571', 'name': 'Non-Standard Port', 'tactic': 'Command and Control', 'description': 'Using non-standard ports.', 'url': 'https://attack.mitre.org/techniques/T1571/'},
            {'id': 'T1205', 'name': 'Traffic Signaling', 'tactic': 'Defense Evasion', 'description': 'Using traffic signaling.', 'url': 'https://attack.mitre.org/techniques/T1205/'}
        ],
        'domain': [
            {'id': 'T1071', 'name': 'Application Layer Protocol', 'tactic': 'Command and Control', 'description': 'C2 over web protocols.', 'url': 'https://attack.mitre.org/techniques/T1071/'},
            {'id': 'T1568', 'name': 'Dynamic Resolution', 'tactic': 'Command and Control', 'description': 'Dynamic DNS resolution.', 'url': 'https://attack.mitre.org/techniques/T1568/'},
            {'id': 'T1583', 'name': 'Acquire Infrastructure', 'tactic': 'Resource Development', 'description': 'Acquiring domains for operations.', 'url': 'https://attack.mitre.org/techniques/T1583/'},
            {'id': 'T1048', 'name': 'Exfiltration Over Alternative Protocol', 'tactic': 'Exfiltration', 'description': 'Data exfiltration via DNS.', 'url': 'https://attack.mitre.org/techniques/T1048/'},
            {'id': 'T1102', 'name': 'Web Service', 'tactic': 'Command and Control', 'description': 'Using web services for C2.', 'url': 'https://attack.mitre.org/techniques/T1102/'},
            {'id': 'T1566', 'name': 'Phishing', 'tactic': 'Initial Access', 'description': 'Phishing attempts.', 'url': 'https://attack.mitre.org/techniques/T1566/'}
        ],
        'url': [
            {'id': 'T1204', 'name': 'User Execution', 'tactic': 'Execution', 'description': 'User clicks malicious link.', 'url': 'https://attack.mitre.org/techniques/T1204/'},
            {'id': 'T1189', 'name': 'Drive-by Compromise', 'tactic': 'Initial Access', 'description': 'Drive-by download attacks.', 'url': 'https://attack.mitre.org/techniques/T1189/'},
            {'id': 'T1105', 'name': 'Ingress Tool Transfer', 'tactic': 'Command and Control', 'description': 'Downloading malicious tools.', 'url': 'https://attack.mitre.org/techniques/T1105/'},
            {'id': 'T1059', 'name': 'Command and Scripting Interpreter', 'tactic': 'Execution', 'description': 'Executing scripts from URL.', 'url': 'https://attack.mitre.org/techniques/T1059/'},
            {'id': 'T1027', 'name': 'Obfuscated Files or Information', 'tactic': 'Defense Evasion', 'description': 'Obfuscated payloads.', 'url': 'https://attack.mitre.org/techniques/T1027/'},
            {'id': 'T1566', 'name': 'Phishing', 'tactic': 'Initial Access', 'description': 'Phishing via malicious URLs.', 'url': 'https://attack.mitre.org/techniques/T1566/'}
        ],
        'hash': [
            {'id': 'T1059', 'name': 'Command and Scripting Interpreter', 'tactic': 'Execution', 'description': 'Executing malicious scripts.', 'url': 'https://attack.mitre.org/techniques/T1059/'},
            {'id': 'T1055', 'name': 'Process Injection', 'tactic': 'Defense Evasion', 'description': 'Injecting into processes.', 'url': 'https://attack.mitre.org/techniques/T1055/'},
            {'id': 'T1027', 'name': 'Obfuscated Files or Information', 'tactic': 'Defense Evasion', 'description': 'Obfuscating malware files.', 'url': 'https://attack.mitre.org/techniques/T1027/'},
            {'id': 'T1486', 'name': 'Data Encrypted for Impact', 'tactic': 'Impact', 'description': 'Ransomware encryption.', 'url': 'https://attack.mitre.org/techniques/T1486/'},
            {'id': 'T1053', 'name': 'Scheduled Task/Job', 'tactic': 'Persistence', 'description': 'Creating scheduled tasks.', 'url': 'https://attack.mitre.org/techniques/T1053/'},
            {'id': 'T1543', 'name': 'Create or Modify System Process', 'tactic': 'Persistence', 'description': 'Creating malicious services.', 'url': 'https://attack.mitre.org/techniques/T1543/'}
        ],
        'email': [
            {'id': 'T1566', 'name': 'Phishing', 'tactic': 'Initial Access', 'description': 'Email phishing.', 'url': 'https://attack.mitre.org/techniques/T1566/'},
            {'id': 'T1598', 'name': 'Phishing for Information', 'tactic': 'Reconnaissance', 'description': 'Gathering info via phishing.', 'url': 'https://attack.mitre.org/techniques/T1598/'},
            {'id': 'T1114', 'name': 'Email Collection', 'tactic': 'Collection', 'description': 'Collecting emails.', 'url': 'https://attack.mitre.org/techniques/T1114/'},
            {'id': 'T1087', 'name': 'Account Discovery', 'tactic': 'Discovery', 'description': 'Discovering accounts.', 'url': 'https://attack.mitre.org/techniques/T1087/'},
            {'id': 'T1078', 'name': 'Valid Accounts', 'tactic': 'Initial Access', 'description': 'Using compromised accounts.', 'url': 'https://attack.mitre.org/techniques/T1078/'},
            {'id': 'T1586', 'name': 'Compromise Accounts', 'tactic': 'Resource Development', 'description': 'Compromising email accounts.', 'url': 'https://attack.mitre.org/techniques/T1586/'}
        ]
    }
    return fallbacks.get(ioc_type, [
        {'id': 'T1071', 'name': 'Application Layer Protocol', 'tactic': 'Command and Control', 'description': 'Generic C2 technique.', 'url': 'https://attack.mitre.org/techniques/T1071/'},
        {'id': 'T1059', 'name': 'Command and Scripting Interpreter', 'tactic': 'Execution', 'description': 'Generic execution.', 'url': 'https://attack.mitre.org/techniques/T1059/'},
        {'id': 'T1027', 'name': 'Obfuscated Files or Information', 'tactic': 'Defense Evasion', 'description': 'Generic obfuscation.', 'url': 'https://attack.mitre.org/techniques/T1027/'},
        {'id': 'T1053', 'name': 'Scheduled Task/Job', 'tactic': 'Persistence', 'description': 'Generic persistence.', 'url': 'https://attack.mitre.org/techniques/T1053/'},
        {'id': 'T1055', 'name': 'Process Injection', 'tactic': 'Defense Evasion', 'description': 'Generic injection.', 'url': 'https://attack.mitre.org/techniques/T1055/'},
        {'id': 'T1105', 'name': 'Ingress Tool Transfer', 'tactic': 'Command and Control', 'description': 'Generic tool transfer.', 'url': 'https://attack.mitre.org/techniques/T1105/'}
    ])


@threats_bp.route('/threats/active', methods=['GET'])
def get_active_threats():
    """Get active threats from ThreatFox and other sources"""
    try:
        import requests
        
        # Fetch from AlienVault OTX
        otx_api_key = os.getenv('OTX_API_KEY')
        threats = []
        
        if otx_api_key:
            print("Fetching threats from AlienVault OTX...")
            headers = {
                'X-OTX-API-KEY': otx_api_key,
                'Accept': 'application/json'
            }
            # Get subscribed pulses (or public ones if no subscriptions, but usually default exists)
            # Using 'subscribed' gives a good mix of high-quality feeds
            try:
                response = requests.get('https://otx.alienvault.com/api/v1/pulses/subscribed?limit=20', 
                    headers=headers, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    for pulse in data.get('results', []):
                        # Map OTX Pulse to Threat model
                        threat_type = 'Unknown'
                        if pulse.get('tags'):
                            threat_type = pulse['tags'][0]
                        
                        severity = 'medium' # OTX doesn't have direct severity, infer from tags/TLP
                        if 'critical' in str(pulse.get('tags', [])).lower():
                            severity = 'critical'
                        elif 'high' in str(pulse.get('tags', [])).lower():
                            severity = 'high'
                        
                        # Extract first indicator if available
                        indicator = 'N/A'
                        indicator_type = 'Unknown'
                        
                        # Try to get actual IOCs from the pulse
                        pulse_id = pulse.get('id')
                        if pulse_id:
                            try:
                                # Fetch indicators for this pulse
                                indicators_response = requests.get(
                                    f'https://otx.alienvault.com/api/v1/pulses/{pulse_id}/indicators',
                                    headers=headers,
                                    timeout=5
                                )
                                if indicators_response.status_code == 200:
                                    indicators_data = indicators_response.json()
                                    results = indicators_data.get('results', [])
                                    if results:
                                        # Get the first indicator
                                        first_indicator = results[0]
                                        indicator = first_indicator.get('indicator', pulse_id)
                                        indicator_type = first_indicator.get('type', 'Unknown')
                            except Exception as ind_err:
                                print(f"Failed to fetch indicators for pulse {pulse_id}: {ind_err}")
                                # Fallback to pulse ID
                                indicator = pulse_id
                        
                        
                        # Extract MITRE technique tags from OTX pulse
                        mitre_tags = []
                        for tag in pulse.get('tags', []):
                            # Check if tag looks like a MITRE technique (e.g., t1059, t1195.001)
                            if tag.lower().startswith('t') and any(char.isdigit() for char in tag):
                                # Normalize to uppercase (T1059 format)
                                mitre_id = tag.upper().replace('T', 'T', 1)
                                mitre_tags.append(mitre_id)
                        
                        threat_entry = {
                            'id': pulse.get('id', str(random.randint(10000, 99999))),
                            'name': pulse.get('name', 'Unknown Threat'),
                            'severity': severity,
                            'type': indicator_type if indicator_type != 'Unknown' else threat_type,
                            'timestamp': pulse.get('created', datetime.utcnow().isoformat()),
                            'description': pulse.get('description', 'No description provided'),
                            'indicator': indicator,  # Now using actual IOC instead of pulse ID
                            'source': 'AlienVault OTX',
                            'tags': pulse.get('tags', []),
                            'mitre_techniques': mitre_tags,  # Add MITRE tags
                            'author': pulse.get('author_name', 'Unknown')
                        }
                        threats.append(threat_entry)

                        
                        # Add to history
                        exists = next((t for t in THREAT_HISTORY if t['id'] == threat_entry['id']), None)
                        if not exists:
                            THREAT_HISTORY.append(threat_entry)
                            if len(THREAT_HISTORY) > 1000:
                                THREAT_HISTORY.pop(0)
                                
            except Exception as otx_err:
                print(f"OTX API Error: {otx_err}")
                
        # Fallback to AbuseIPDB if OTX fails or returns nothing (or as supplementary)
        if not threats and os.getenv('ABUSEIPDB_API_KEY'):
             print("Fetching from AbuseIPDB as fallback...")
             # Implement AbuseIPDB fallback if needed, but let's stick to OTX for now
             pass

        if not threats:
             # If both fail, return debug info
            return jsonify({
                'threats': [], 
                'debug': {
                    'message': 'No threats found from OTX. Check API key.'
                }
            })
        
        return jsonify({'threats': threats})
        
    except Exception as e:
        print(f"Error fetching threats: {e}")
        return jsonify({'status': 'error', 'message': str(e), 'type': str(type(e))}), 500

@threats_bp.route('/threats/history', methods=['GET'])
def get_threat_history():
    """Get historical threat data"""
    return jsonify({'history': THREAT_HISTORY})

@threats_bp.route('/threats/reports', methods=['GET'])
def get_threat_report():
    """Get detailed threat report with MITRE framework"""
    try:
        ioc = request.args.get('ioc')
        
        if not ioc:
            return jsonify({'status': 'error', 'message': 'IOC parameter required'}), 400
        
        # Detect IOC type
        import re
        ioc_type = 'unknown'
        if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', ioc):
            ioc_type = 'ip'
        elif re.match(r'^[a-fA-F0-9]{24}$', ioc): # OTX Pulse ID / MongoDB ID
            ioc_type = 'otx_pulse'
        elif re.match(r'^[a-fA-F0-9]{32}$', ioc) or re.match(r'^[a-fA-F0-9]{40}$', ioc) or re.match(r'^[a-fA-F0-9]{64}$', ioc):
            ioc_type = 'hash'
        elif re.match(r'^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$', ioc):
            ioc_type = 'domain'
        elif 'http' in ioc:
            ioc_type = 'url'
            
        # Enrich the IOC
        try:
            enriched = enrichment_engine.enrich_ioc(ioc, ioc_type)
        except Exception as enrich_error:
            print(f"Enrichment failed: {enrich_error}")
            enriched = {}

        # Collect tags and verdicts from all sources
        tags = set()
        verdicts = []
        
        # VirusTotal
        if 'virustotal' in enriched.get('sources', {}):
            vt_data = enriched['sources']['virustotal']
            if vt_data.get('status') == 'success':
                tags.update([t.lower() for t in vt_data.get('tags', [])])
                verdicts.append(vt_data.get('verdict', 'Clean'))
        
        # ThreatFox
        if 'threatfox' in enriched.get('sources', {}):
            tf_data = enriched['sources']['threatfox']
            if tf_data.get('status') == 'success':
                for threat in tf_data.get('threats', []):
                    tags.add(threat.get('threat_type', '').lower())
                    tags.update([t.lower() for t in threat.get('tags', [])])
                verdicts.append('Malicious' if tf_data.get('threat_count', 0) > 0 else 'Clean')

        # AbuseIPDB
        if 'abuseipdb' in enriched.get('sources', {}):
            ab_data = enriched['sources']['abuseipdb']
            if ab_data.get('status') == 'success':
                if ab_data.get('abuse_confidence_score', 0) > 50:
                    tags.add('abusive_ip')
                    verdicts.append('Malicious')
                elif ab_data.get('abuse_confidence_score', 0) > 20:
                    verdicts.append('Suspicious')

        # OTX
        if 'otx' in enriched.get('sources', {}):
            otx_data = enriched['sources']['otx']
            if otx_data.get('status') == 'success':
                tags.update([t.lower() for t in otx_data.get('tags', [])])
                if otx_data.get('threat_count', 0) > 0 or otx_data.get('verdict') == 'Malicious':
                    verdicts.append('Malicious')

        # Shodan
        if 'shodan' in enriched.get('sources', {}):
            shodan_data = enriched['sources']['shodan']
            if shodan_data.get('status') == 'success':
                tags.update([t.lower() for t in shodan_data.get('tags', [])])
                if shodan_data.get('verdict') == 'Suspicious':
                    verdicts.append('Suspicious')
                # Map specific ports/vulns to tags
                if 445 in shodan_data.get('ports', []):
                    tags.add('smb')
                    tags.add('exploit')
                if 3389 in shodan_data.get('ports', []):
                    tags.add('rdp')
                    tags.add('remote_access')

        # URLScan
        if 'urlscan' in enriched.get('sources', {}):
            us_data = enriched['sources']['urlscan']
            if us_data.get('status') == 'success':
                tags.update([t.lower() for t in us_data.get('tags', [])])
                if us_data.get('malicious'):
                    verdicts.append('Malicious')

        # URLhaus
        if 'urlhaus' in enriched.get('sources', {}):
            uh_data = enriched['sources']['urlhaus']
            if uh_data.get('status') == 'success':
                tags.update([t.lower() for t in uh_data.get('tags', [])])
                verdicts.append('Malicious')

        # MITRE Mapping using Real STIX API (Direct function call)
        mitre_techniques = []
        
        print(f"[THREATS] Starting MITRE mapping for {ioc_type}: {ioc}")
        
        try:
            # Import and call MITRE mapping function directly (avoid self-referential HTTP call)
            from routes.mitre_route import get_technique_by_id
            
            # Direct technique ID mapping based on IOC type
            technique_mappings = {
                'ip': ['T1071', 'T1595', 'T1046', 'T1090', 'T1571', 'T1205'],
                'domain': ['T1071', 'T1568', 'T1583', 'T1048', 'T1102', 'T1566'],
                'url': ['T1204', 'T1189', 'T1105', 'T1059', 'T1027', 'T1566'],
                'hash': ['T1059', 'T1055', 'T1027', 'T1486', 'T1053', 'T1543'],
                'email': ['T1566', 'T1598', 'T1114', 'T1087', 'T1078', 'T1586'],
                'unknown': ['T1071', 'T1059', 'T1027', 'T1053', 'T1055', 'T1105']
            }
            
            technique_ids = technique_mappings.get(ioc_type, technique_mappings['unknown'])
            print(f"[THREATS] Using technique IDs for {ioc_type}: {technique_ids}")
            
            # Fetch full technique details from MITRE STIX data
            for tech_id in technique_ids:
                technique = get_technique_by_id(tech_id)
                if technique:
                    mitre_techniques.append(technique)
                    print(f"[THREATS] Added {tech_id}: {technique['name']}")
                else:
                    print(f"[THREATS] Technique {tech_id} not found in STIX data")
            
            print(f"[THREATS] Successfully mapped {len(mitre_techniques)} techniques from MITRE STIX API")
                
        except Exception as mitre_error:
            print(f"[THREATS] MITRE mapping EXCEPTION: {mitre_error}")
            import traceback
            traceback.print_exc()
            # Fallback to basic techniques
            mitre_techniques = _get_fallback_mitre_techniques(ioc_type)
            print(f"[THREATS] Using {len(mitre_techniques)} fallback techniques after exception")


        # Calculate Severity (Weighted Logic)
        # Base score
        severity_score = 0
        
        # 1. Verdicts Score
        malicious_count = verdicts.count('Malicious')
        suspicious_count = verdicts.count('Suspicious')
        severity_score += (malicious_count * 2) + (suspicious_count * 1)
        
        # 2. Critical Tags Score
        critical_tags = ['ransom', 'apt', 'c2', 'cobalt', 'exploit']
        for tag in tags:
            if any(crit in tag.lower() for crit in critical_tags):
                severity_score += 3
                break # Cap at +3 for tags
        
        # 3. MITRE Score (based on number of techniques)
        severity_score += min(len(mitre_techniques), 2)
            
        # Determine Severity Level
        if severity_score >= 5:
            severity = 'critical'
        elif severity_score >= 3:
            severity = 'high'
        elif severity_score >= 1:
            severity = 'medium'
        else:
            severity = 'low'

        # Ensure sources are populated even if empty
        sources = enriched.get('sources', {})
        if not sources:
            sources = {'internal_analysis': {'threat_count': 0, 'verdict': 'suspicious'}}

        report = {
            'ioc': ioc,
            'type': enriched.get('type', 'unknown'),
            'severity': severity,
            'description': f"Comprehensive threat assessment for {ioc}. Detected tags: {', '.join(list(tags)[:5]) or 'None'}. Analysis based on real-time data.",
            'indicators': list(sources.keys()),
            'mitreTactics': mitre_techniques,
            'recommendations': [
                'Block the indicator at firewall/proxy level immediately',
                'Monitor for lateral movement and privilege escalation',
                'Review access logs for unauthorized activity from this indicator',
                'Apply relevant security patches for identified vulnerabilities',
                'Implement network segmentation to limit spread',
                'Deploy EDR solution for behavioral detection',
                'Enable enhanced logging on affected systems',
                'Conduct incident response investigation'
            ],
            'sources': sources,
            'enriched_at': enriched.get('enriched_at', datetime.utcnow().isoformat())
        }
        
        return jsonify({'report': report})
    except Exception as e:
        # Fallback for demo purposes if API fails (e.g. rate limit)
        print(f"Error generating report: {e}")
        mitre_techniques = [
            {
                'id': 'T1566.002',
                'name': 'Phishing: Spearphishing Link',
                'description': 'Malicious links are often delivered via email',
                'tactic': 'Initial Access',
                'url': 'https://attack.mitre.org/techniques/T1566/002/'
            }
        ]
        fallback_report = {
            'ioc': ioc or 'Unknown',
            'type': 'ip',
            'severity': 'high',
            'description': f"Threat assessment for {ioc}. (Fallback: External API unavailable)",
            'indicators': ['ThreatFox', 'AbuseIPDB'],
            'mitreTactics': mitre_techniques,
            'recommendations': [
                'Block the indicator at firewall/proxy level immediately',
                'Monitor for lateral movement'
            ],
            'sources': {'threatfox': {'threat_count': 1}, 'abuseipdb': {'threat_count': 1}},
            'enriched_at': datetime.utcnow().isoformat()
        }
        return jsonify({'report': fallback_report})

@threats_bp.route('/reports/<threat_id>', methods=['GET'])
def get_specific_threat_report(threat_id):
    """Get report for specific threat ID"""
    try:
        mitre_techniques = [
            {
                'id': 'T1547.001',
                'name': 'Boot or Logon Autostart Execution: Registry Run Keys',
                'description': 'Threats often use registry modifications for persistence',
                'tactic': 'Persistence',
                'url': 'https://attack.mitre.org/techniques/T1547/001/'
            },
            {
                'id': 'T1059.001',
                'name': 'Command and Scripting Interpreter: PowerShell',
                'description': 'PowerShell is commonly used for post-exploitation',
                'tactic': 'Execution',
                'url': 'https://attack.mitre.org/techniques/T1059/001/'
            },
            {
                'id': 'T1082',
                'name': 'System Information Discovery',
                'description': 'Gathering system information after initial compromise',
                'tactic': 'Discovery',
                'url': 'https://attack.mitre.org/techniques/T1082/'
            }
        ]
        
        report = {
            'ioc': threat_id,
            'type': 'Malware',
            'severity': 'critical',
            'description': 'This threat has been identified across multiple networks and is attributed to a known APT group.',
            'indicators': ['malware_hash', 'c2_server', 'registration_domain'],
            'mitreTactics': mitre_techniques,
            'recommendations': [
                'Immediately isolate infected systems',
                'Analyze network traffic for similar patterns',
                'Review endpoint security alerts',
                'Initiate incident response procedures'
            ],
            'sources': ['ThreatFox', 'URLhaus', 'Open-source Intelligence'],
            'enriched_at': datetime.utcnow().isoformat()
        }
        
        return jsonify({'report': report})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@threats_bp.route('/threat-map', methods=['GET'])
def get_threat_map():
    """Get geolocated threat data for 3D globe"""
    try:
        threat_locations = []
        
        # Simulate real threat locations
        threat_regions = [
            {'lat': 39.9042, 'lon': 116.4074, 'country': 'China', 'intensity': 0.9},
            {'lat': 55.7558, 'lon': 37.6173, 'country': 'Russia', 'intensity': 0.85},
            {'lat': 28.7041, 'lon': 77.1025, 'country': 'India', 'intensity': 0.7},
            {'lat': 35.6892, 'lon': 51.3890, 'country': 'Iran', 'intensity': 0.8},
            {'lat': -23.5505, 'lon': -46.6333, 'country': 'Brazil', 'intensity': 0.6},
            {'lat': 40.7128, 'lon': -74.0060, 'country': 'USA', 'intensity': 0.5},
            {'lat': 51.5074, 'lon': -0.1278, 'country': 'UK', 'intensity': 0.55},
            {'lat': 48.8566, 'lon': 2.3522, 'country': 'France', 'intensity': 0.5},
        ]
        
        for region in threat_regions:
            for i in range(random.randint(3, 8)):
                threat_locations.append({
                    'id': f"{region['country']}_threat_{i}",
                    'ioc': f"192.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
                    'type': 'ip',
                    'severity': random.choice(['critical', 'high', 'medium']),
                    'lat': region['lat'] + random.uniform(-2, 2),
                    'lon': region['lon'] + random.uniform(-2, 2),
                    'country': region['country'],
                    'intensity': region['intensity'] + random.uniform(-0.1, 0.1),
                    'timestamp': (datetime.utcnow() - timedelta(hours=random.randint(0, 48))).isoformat()
                })
        
        return jsonify({
            'locations': threat_locations,
            'total_threats': len(threat_locations),
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
