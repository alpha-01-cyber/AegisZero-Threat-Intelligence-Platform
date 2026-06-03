"""MITRE ATT&CK Framework Mapping Service"""

class MitreMappingService:
    """Map IOCs and threats to MITRE ATT&CK techniques"""
    
    def __init__(self):
        self.techniques_db = self._load_techniques()
    
    def _load_techniques(self):
        """Load MITRE ATT&CK techniques database"""
        return {
            'T1566': {
                'name': 'Phishing',
                'tactics': ['Initial Access'],
                'description': 'Adversaries send phishing emails to gain initial access',
                'mitigation': ['Email filtering', 'User training', 'DMARC/SPF'],
                'detection': 'Monitor email gateways for suspicious content'
            },
            'T1059': {
                'name': 'Command and Scripting Interpreter',
                'tactics': ['Execution'],
                'description': 'Using command-line interfaces to execute code',
                'mitigation': ['Script execution restrictions', 'Application whitelisting'],
                'detection': 'Monitor process creation and script execution'
            },
            'T1018': {
                'name': 'Remote System Discovery',
                'tactics': ['Discovery'],
                'description': 'Adversaries enumerate systems in the network',
                'mitigation': ['Network segmentation', 'Restrict ICMP'],
                'detection': 'Monitor network scanning activities'
            },
            'T1021': {
                'name': 'Remote Services',
                'tactics': ['Lateral Movement'],
                'description': 'Adversaries use remote services for lateral movement',
                'mitigation': ['MFA', 'VPN', 'Firewall rules'],
                'detection': 'Monitor remote access attempts'
            },
            'T1055': {
                'name': 'Process Injection',
                'tactics': ['Defense Evasion', 'Privilege Escalation'],
                'description': 'Injecting code into running processes',
                'mitigation': ['Code integrity checks', 'Memory protections'],
                'detection': 'Monitor process memory modifications'
            }
        }
    
    def map_ioc_to_techniques(self, ioc: str, ioc_type: str) -> dict:
        """Map an IOC to potential MITRE techniques"""
        techniques = []
        
        # Simplified mapping logic based on IOC type
        if ioc_type == 'IP':
            techniques = ['T1018', 'T1021', 'T1595']
        elif ioc_type == 'Domain':
            techniques = ['T1566', 'T1071', 'T1071']
        elif ioc_type == 'Hash':
            techniques = ['T1036', 'T1140', 'T1027']
        elif ioc_type == 'URL':
            techniques = ['T1566', 'T1204', 'T1204']
        
        mapped = []
        for tech_id in techniques:
            if tech_id in self.techniques_db:
                mapped.append({
                    'id': tech_id,
                    **self.techniques_db[tech_id]
                })
        
        return {
            'ioc': ioc,
            'type': ioc_type,
            'techniques': mapped,
            'risk_score': len(mapped) * 15 + 30
        }
    
    def get_technique_details(self, technique_id: str) -> dict:
        """Get detailed information about a technique"""
        return self.techniques_db.get(technique_id, {})
