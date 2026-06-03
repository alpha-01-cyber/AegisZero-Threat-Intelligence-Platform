# Mohid Umer, M Ahsan, M Saim
# 23i-2130, 23i-2117, 23i-2119
# tld_risk.py

"""
TLD Risk Scoring based on phishing/malware statistics
Data source: Various threat intelligence reports
"""

# TLD Risk Scores (0-100, higher = more risky)
TLD_RISK_SCORES = {
    # Very High Risk (90-100) - Freenom TLDs and high-abuse new gTLDs
    'buzz': 99,
    'host': 99,
    'wang': 99,
    'tk': 89,
    'icu': 92,
    'live': 91,
    'cf': 85,
    'gq': 88,
    'ga': 85,
    'ml': 80,
    'top': 81,
    
    # High Risk (70-89) - Known abuse-prone TLDs
    'info': 85,
    'cn': 75,
    'xyz': 66,
    'us': 69,
    'online': 62,
    
    # Medium Risk (40-69)
    'com': 57,  # High volume but also legitimate
    'net': 44,
    'ru': 35,
    
    # Low Risk (0-39)
    'org': 33,
    'edu': 5,
    'gov': 2,
    'mil': 1,
    
    # Country codes with good reputation
    'uk': 15,
    'de': 18,
    'fr': 20,
    'ca': 12,
    'au': 14,
    'jp': 10,
}

def get_tld_risk(domain: str) -> dict:
    """
    Get risk score for a domain based on its TLD
    Returns: {
        'tld': str,
        'risk_score': int (0-100),
        'risk_level': str ('low', 'medium', 'high', 'critical'),
        'warning': str or None
    }
    """
    try:
        # Extract TLD
        parts = domain.lower().split('.')
        if len(parts) < 2:
            return {'tld': 'unknown', 'risk_score': 0, 'risk_level': 'unknown', 'warning': None}
        
        tld = parts[-1]
        risk_score = TLD_RISK_SCORES.get(tld, 30)  # Default to medium-low if unknown
        
        # Determine risk level
        if risk_score >= 85:
            risk_level = 'critical'
            warning = f"This domain uses .{tld} TLD which is heavily abused by phishers and malware distributors."
        elif risk_score >= 60:
            risk_level = 'high'
            warning = f"The .{tld} TLD has a high percentage of malicious domains. Exercise caution."
        elif risk_score >= 30:
            risk_level = 'medium'
            warning = f"The .{tld} TLD has moderate abuse rates. Verify domain legitimacy."
        else:
            risk_level = 'low'
            warning = None
        
        return {
            'tld': tld,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'warning': warning
        }
    except Exception as e:
        return {'tld': 'error', 'risk_score': 0, 'risk_level': 'unknown', 'warning': None}
