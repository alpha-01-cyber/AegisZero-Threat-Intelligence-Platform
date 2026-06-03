import requests
from typing import List, Dict
from datetime import datetime

class ImpactSimulator:
    def __init__(self):
        self.mitre_techniques = self._fetch_mitre_techniques()
        self.network_assets = {}
    
    def _fetch_mitre_techniques(self):
        """Fetch MITRE ATT&CK techniques from actual framework"""
        try:
            # This would integrate with MITRE ATT&CK API
            # For now, return basic mapping
            return {
                'T1071': 'Application Layer Protocol',
                'T1566': 'Phishing',
                'T1595': 'Active Scanning',
                'T1087': 'Account Discovery',
                'T1110': 'Brute Force',
                'T1021': 'Remote Services'
            }
        except:
            return {}
    
    def register_asset(self, asset_id, asset_info):
        """Register network asset for impact analysis"""
        self.network_assets[asset_id] = {
            'name': asset_info.get('name'),
            'type': asset_info.get('type'),  # web_server, db_server, workstation, etc.
            'criticality': asset_info.get('criticality', 5),
            'services': asset_info.get('services', []),
            'last_scan': datetime.utcnow().isoformat()
        }
    
    def simulate_ioc_impact(self, ioc_value, ioc_type, enrichment_data):
        """Simulate the impact of an IOC on known assets"""
        impact_analysis = {
            'ioc': ioc_value,
            'type': ioc_type,
            'affected_assets': [],
            'estimated_risk': 'medium',
            'attack_vectors': []
        }
        
        # Extract threat indicators from enrichment
        threat_score = self._calculate_threat_score(enrichment_data)
        impact_analysis['estimated_risk'] = self._risk_level(threat_score)
        
        # Determine potential attack vectors
        impact_analysis['attack_vectors'] = self._identify_attack_vectors(ioc_type, enrichment_data)
        
        # Check for affected assets
        for asset_id, asset_info in self.network_assets.items():
            if self._is_asset_affected(asset_info['services'], ioc_value):
                impact_analysis['affected_assets'].append({
                    'asset_id': asset_id,
                    'name': asset_info['name'],
                    'type': asset_info['type'],
                    'criticality': asset_info['criticality']
                })
        
        # Generate human-readable description
        description = f"This IOC presents a {impact_analysis['estimated_risk'].upper()} risk."
        if impact_analysis['attack_vectors']:
            vectors_str = ", ".join([v.replace('_', ' ') for v in impact_analysis['attack_vectors']])
            description += f" Potential attack vectors include: {vectors_str}."
        
        if impact_analysis['affected_assets']:
            description += f" It may affect {len(impact_analysis['affected_assets'])} known assets in your network."
        else:
            description += " No immediate correlation with known internal assets detected."

        impact_analysis['description'] = description
        
        return impact_analysis
    
    def generate_chart_data(self, enrichment_data):
        """Generate chart-ready data from enrichment sources for visualization"""
        chart_data = {
            'vendor_analysis': [],      # Pie/Bar chart: Detection by vendor
            'severity_breakdown': {},   # Overall severity metrics
            'confidence_score': 0,      # Gauge chart: Overall confidence
            'source_comparison': []     # Radar chart: Compare sources
        }
        
        sources = enrichment_data.get('sources', {})
        has_vt_data = False
        
        # VirusTotal vendor breakdown (most important for charts)
        if 'virustotal' in sources and sources['virustotal'].get('status') == 'success':
            vt_data = sources['virustotal']
            malicious = vt_data.get('malicious_count', 0)
            suspicious = vt_data.get('suspicious_count', 0)
            harmless = vt_data.get('harmless_count', 0)
            undetected = vt_data.get('undetected_count', 0)
            
            has_vt_data = True
            
            # Only include non-zero values for cleaner charts
            if malicious > 0:
                chart_data['vendor_analysis'].append({
                    'name': 'Malicious',
                    'value': malicious,
                    'color': '#ef4444',
                    'fill': '#ef4444'
                })
            if suspicious > 0:
                chart_data['vendor_analysis'].append({
                    'name': 'Suspicious',
                    'value': suspicious,
                    'color': '#f59e0b',
                    'fill': '#f59e0b'
                })
            if harmless > 0:
                chart_data['vendor_analysis'].append({
                    'name': 'Clean',
                    'value': harmless,
                    'color': '#10b981',
                    'fill': '#10b981'
                })
            if undetected > 0:
                chart_data['vendor_analysis'].append({
                    'name': 'Undetected',
                    'value': undetected,
                    'color': '#6b7280',
                    'fill': '#6b7280'
                })
            
            # Calculate overall confidence based on detection ratio
            total = malicious + suspicious + harmless + undetected
            if total > 0:
                threat_ratio = (malicious + suspicious) / total
                chart_data['confidence_score'] = int(threat_ratio * 100)
        
        # If no VirusTotal data, create a placeholder chart showing "No Detections"
        if not has_vt_data or len(chart_data['vendor_analysis']) == 0:
            chart_data['vendor_analysis'] = [{
                'name': 'No Detections',
                'value': 1,
                'color': '#6b7280',
                'fill': '#6b7280'
            }]
        
        # AbuseIPDB confidence (if VirusTotal not available or to supplement)
        if 'abuseipdb' in sources and sources['abuseipdb'].get('status') == 'success':
            abuse_score = sources['abuseipdb'].get('abuse_confidence_score', 0)
            if chart_data['confidence_score'] == 0:
                chart_data['confidence_score'] = abuse_score
            else:
                # Average with VirusTotal confidence
                chart_data['confidence_score'] = int((chart_data['confidence_score'] + abuse_score) / 2)
        
        # Multi-source comparison for radar chart - ALWAYS include all sources
        source_scores = []
        
        # Always add VirusTotal (even if 0)
        if 'virustotal' in sources:
            if sources['virustotal'].get('status') == 'success':
                vt_score = min(100, sources['virustotal'].get('malicious_count', 0) * 10)
            else:
                vt_score = 0
            source_scores.append({'source': 'VirusTotal', 'score': vt_score})
        
        # Always add AbuseIPDB (even if 0)
        if 'abuseipdb' in sources:
            if sources['abuseipdb'].get('status') == 'success':
                abuse_score = sources['abuseipdb'].get('abuse_confidence_score', 0)
            else:
                abuse_score = 0
            source_scores.append({'source': 'AbuseIPDB', 'score': abuse_score})
        
        # Always add OTX (even if 0)
        if 'otx' in sources:
            if sources['otx'].get('status') == 'success':
                otx_count = sources['otx'].get('threat_count', 0)
                otx_score = min(100, otx_count * 20)
            else:
                otx_score = 0
            source_scores.append({'source': 'AlienVault', 'score': otx_score})
        
        # Always add ThreatFox (even if 0)
        if 'threatfox' in sources:
            if sources['threatfox'].get('status') == 'success':
                tf_count = sources['threatfox'].get('threat_count', 0)
                tf_score = min(100, tf_count * 25)
            else:
                tf_score = 0
            source_scores.append({'source': 'ThreatFox', 'score': tf_score})
        
        # Always add Shodan (even if 0)
        if 'shodan' in sources:
            if sources['shodan'].get('status') == 'success':
                vuln_count = len(sources['shodan'].get('vulns', []))
                shodan_score = min(100, vuln_count * 15)
            else:
                shodan_score = 0
            source_scores.append({'source': 'Shodan', 'score': shodan_score})
        
        # Ensure we always have at least 3 sources for radar chart
        if len(source_scores) < 3:
            # Add placeholder sources if needed
            existing_sources = {s['source'] for s in source_scores}
            default_sources = ['VirusTotal', 'AbuseIPDB', 'AlienVault', 'ThreatFox']
            for src in default_sources:
                if src not in existing_sources and len(source_scores) < 3:
                    source_scores.append({'source': src, 'score': 0})
        
        chart_data['source_comparison'] = source_scores
        
        return chart_data
    
    
    
    def _calculate_threat_score(self, enrichment_data):
        """Calculate aggregated threat score from multiple sources"""
        score = 0
        weights = {'otx': 0.25, 'abuseipdb': 0.3, 'virustotal': 0.3, 'urlscan': 0.15}
        
        sources = enrichment_data.get('sources', {})
        for source, weight in weights.items():
            if source in sources and sources[source].get('status') == 'success':
                source_score = self._extract_score(sources[source], source)
                score += source_score * weight
        
        return min(100, score)
    
    def _extract_score(self, source_data, source_name):
        """Extract threat score from individual source"""
        if source_name == 'otx':
            return min(100, source_data.get('score', 0) * 5)
        elif source_name == 'abuseipdb':
            return source_data.get('abuseConfidenceScore', 0)
        elif source_name == 'virustotal':
            stats = source_data.get('last_analysis_stats', {})
            return min(100, stats.get('malicious', 0) * 3)
        return 0
    
    def _risk_level(self, score):
        """Determine risk level from score"""
        if score >= 80: return 'critical'
        if score >= 60: return 'high'
        if score >= 40: return 'medium'
        if score >= 20: return 'low'
        return 'unknown'
    
    def _identify_attack_vectors(self, ioc_type, enrichment_data):
        """Identify possible attack vectors based on IOC type"""
        vectors = []
        if ioc_type == 'ip':
            vectors = ['network_scanning', 'c2_communication', 'ddos_source', 'proxy']
        elif ioc_type == 'domain':
            vectors = ['phishing', 'malware_distribution', 'c2_server', 'dns_tunneling']
        elif ioc_type == 'url':
            vectors = ['phishing', 'drive_by_download', 'malicious_redirect']
        elif ioc_type == 'hash':
            vectors = ['malware', 'ransomware', 'trojan']
        
        return vectors
    
    def _is_asset_affected(self, asset_services, ioc_value):
        """Check if the asset is affected by the IOC"""
        # Placeholder logic for checking if asset services are affected by IOC
        # This should be replaced with actual logic based on IOC type and asset services
        return ioc_value in asset_services
