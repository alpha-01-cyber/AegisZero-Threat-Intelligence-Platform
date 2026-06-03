# Mohid Umer, M Ahsan, M Saim
# 23i-2130, 23i-2117, 23i-2119
# ingestion.py

"""IOC Ingestion and Validation Service"""
import re
from typing import Tuple, List, Dict, Any

def validate_ip(ip: str) -> bool:
    """Validate IPv4 address"""
    pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    if not re.match(pattern, ip):
        return False
    parts = ip.split('.')
    return all(0 <= int(part) <= 255 for part in parts)

def validate_domain(domain: str) -> bool:
    """Validate domain name"""
    pattern = r'^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
    return bool(re.match(pattern, domain))

def validate_hash(hash_str: str) -> bool:
    """Validate hash (MD5, SHA1, SHA256, or 24-char truncated)"""
    patterns = {
        'truncated': r'^[a-fA-F0-9]{24}$',  # Truncated MD5 or custom hash
        'md5': r'^[a-fA-F0-9]{32}$',
        'sha1': r'^[a-fA-F0-9]{40}$',
        'sha256': r'^[a-fA-F0-9]{64}$'
    }
    return any(re.match(pattern, hash_str) for pattern in patterns.values())

def validate_url(url: str) -> bool:
    """Validate URL"""
    pattern = r'^https?://[^\s/$.?#].[^\s]*$'
    return bool(re.match(pattern, url))

def detect_ioc_type(value: str) -> str:
    """Auto-detect IOC type"""
    if validate_ip(value):
        return 'ip'
    elif validate_hash(value):  # Check hash BEFORE OTX Pulse ID
        return 'hash'
    elif re.match(r'^[a-fA-F0-9]{24}$', value):  # OTX Pulse ID / MongoDB ObjectID
        return 'otx_pulse'
    elif validate_domain(value):
        return 'domain'
    elif validate_url(value):
        return 'url'
    return 'unknown'

def validate_and_normalize_iocs(iocs: List[Any]) -> Tuple[bool, Any]:
    """Validate and normalize IOC input"""
    if not isinstance(iocs, list):
        return False, "IOCs must be a list"
    
    if len(iocs) == 0:
        return False, "IOC list cannot be empty"
    
    normalized = []
    for ioc in iocs:
        if isinstance(ioc, str):
            ioc_type = detect_ioc_type(ioc)
            if ioc_type == 'unknown':
                continue
            normalized.append({'value': ioc, 'type': ioc_type})
        elif isinstance(ioc, dict) and 'value' in ioc:
            ioc_type = ioc.get('type', detect_ioc_type(ioc['value']))
            normalized.append({'value': ioc['value'], 'type': ioc_type})
    
    if len(normalized) == 0:
        return False, "No valid IOCs found"
    
    return True, normalized
