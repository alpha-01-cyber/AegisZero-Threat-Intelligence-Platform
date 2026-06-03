# Mohid Umer, M Ahsan, M Saim
# 23i-2130, 23i-2117, 23i-2119
# analytics.py

from flask import Blueprint, request, jsonify
from services.graph_builder import GraphBuilder
from services.temporal_analysis import TemporalAnalysis
from datetime import datetime, timedelta
import random

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/v1')

@analytics_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Get comprehensive analytics data from real sources"""
    import requests
    import os
    from routes.threats_route import THREAT_HISTORY
    from collections import Counter
    
    # If history is empty, try to fetch some initial data
    if not THREAT_HISTORY:
        otx_api_key = os.getenv('OTX_API_KEY')
        if otx_api_key:
            try:
                headers = {'X-OTX-API-KEY': otx_api_key, 'Accept': 'application/json'}
                response = requests.get('https://otx.alienvault.com/api/v1/pulses/subscribed?limit=50', headers=headers, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    for pulse in data.get('results', []):
                        # Basic mapping to populate history
                        threat_entry = {
                            'id': pulse.get('id'),
                            'timestamp': pulse.get('created'),
                            'severity': 'critical' if 'critical' in str(pulse.get('tags')).lower() else 'high' if 'high' in str(pulse.get('tags')).lower() else 'medium',
                            'type': pulse['tags'][0] if pulse.get('tags') else 'Unknown',
                            'country': 'Unknown' # OTX pulses don't always have country
                        }
                        THREAT_HISTORY.append(threat_entry)
            except Exception as e:
                print(f"Analytics: Failed to fetch initial OTX data: {e}")

    # Process THREAT_HISTORY for analytics
    now = datetime.utcnow()
    
    # 1. Threat Distribution (Time-based)
    threat_counts = {}
    for threat in THREAT_HISTORY:
        try:
            # Parse timestamp (handle different formats if necessary, OTX is usually ISO)
            ts = datetime.fromisoformat(threat['timestamp'].replace('Z', '+00:00'))
            # Group by hour
            key = ts.strftime('%H:00')
            threat_counts[key] = threat_counts.get(key, 0) + 1
        except:
            continue
            
    # Fill in missing hours for the last 24h
    threat_distribution = []
    for i in range(24):
        time_point = now - timedelta(hours=23-i)
        key = time_point.strftime('%H:00')
        threat_distribution.append({
            'time': key,
            'count': threat_counts.get(key, 0)
        })

    # 2. Severity Breakdown
    severity_counts = Counter(t.get('severity', 'medium') for t in THREAT_HISTORY)
    severity_breakdown = [
        {'name': 'Critical', 'value': severity_counts.get('critical', 0)},
        {'name': 'High', 'value': severity_counts.get('high', 0)},
        {'name': 'Medium', 'value': severity_counts.get('medium', 0)},
        {'name': 'Low', 'value': severity_counts.get('low', 0)}
    ]

    # 3. IOC Types
    type_counts = Counter(t.get('type', 'Unknown') for t in THREAT_HISTORY)
    # Get top 5 types
    ioc_types = [{'type': k, 'count': v} for k, v in type_counts.most_common(5)]
    
    # 4. Geographic Distribution (Simulated if missing, or inferred)
    # Since OTX doesn't always give country, we might need to keep this simulated or use a default
    geo_counts = Counter(t.get('country', 'Unknown') for t in THREAT_HISTORY if t.get('country') != 'Unknown')
    if geo_counts:
        geographic = [{'country': k, 'threats': v} for k, v in geo_counts.most_common(5)]
    else:
        # Fallback to simulated if no geo data available yet
        geographic = [
            {'country': 'USA', 'threats': len(THREAT_HISTORY) // 3},
            {'country': 'China', 'threats': len(THREAT_HISTORY) // 4},
            {'country': 'Russia', 'threats': len(THREAT_HISTORY) // 5},
            {'country': 'Unknown', 'threats': len(THREAT_HISTORY) // 6}
        ]

    # 5. Top 10 Capital Cities Threats (Matches Network Map)
    # Since OTX data doesn't have cities, we map them to our monitored capitals
    # This ensures consistency with the Network Map page visualization
    capitals = [
        'Washington DC', 'London', 'Paris', 'Berlin', 'Moscow', 
        'Beijing', 'Tokyo', 'Seoul', 'New Delhi', 'Brasília'
    ]
    
    # Distribute threats among capitals (simulating the network map distribution)
    capital_counts = {city: 0 for city in capitals}
    for i, threat in enumerate(THREAT_HISTORY):
        # Use simple round-robin or hash to assign consistent city to each threat ID
        # This ensures if we see the same threat again, it stays in the same city
        city_index = hash(threat.get('id', str(i))) % len(capitals)
        capital_counts[capitals[city_index]] += 1
        
    capital_threats = [{'city': k, 'threats': v} for k, v in capital_counts.items()]
    # Sort by threat count descending
    capital_threats.sort(key=lambda x: x['threats'], reverse=True)

    return jsonify({
        'threat_distribution': threat_distribution,
        'severity_breakdown': severity_breakdown,
        'ioc_types': ioc_types,
        'geographic_distribution': geographic,
        'capital_threats': capital_threats
    })

@analytics_bp.route('/world-map-threats', methods=['GET'])
def get_world_map_threats():
    """Get threat data for world map visualization"""
    threats = []
    countries = ['China', 'Russia', 'USA', 'Iran', 'Brazil', 'India', 'Nigeria', 'North Korea']
    
    for _ in range(random.randint(15, 30)):
        threats.append({
            'country': random.choice(countries),
            'lat': random.uniform(-60, 60),
            'lon': random.uniform(-180, 180),
            'severity': random.choice(['critical', 'high', 'medium', 'low']),
            'count': random.randint(1, 100),
            'ioc_types': random.sample(['IP', 'Domain', 'Hash', 'URL'], random.randint(1, 3))
        })
    
    return jsonify({'threats': threats})

@analytics_bp.route('/events/timeline', methods=['GET'])
def get_timeline_events():
    """Get events for timeline visualization"""
    now = datetime.utcnow()
    events = []
    
    for i in range(20):
        event_time = now - timedelta(minutes=i*5)
        events.append({
            'id': f'evt_{i}',
            'timestamp': event_time.isoformat(),
            'ioc': f'192.168.{random.randint(1, 255)}.{random.randint(1, 255)}',
            'severity': random.choice(['critical', 'high', 'medium', 'low']),
            'description': f'Suspicious activity detected on port {random.choice([22, 80, 443, 3389])}',
            'type': random.choice(['IP', 'Domain', 'Hash'])
        })
    
    correlations = []
    for i in range(10):
        correlations.append({
            'ioc1': f'192.168.{random.randint(1, 255)}.{random.randint(1, 255)}',
            'ioc2': f'{random.choice(["example", "malicious"])}.com',
            'correlation_type': random.choice(['C2', 'Exfiltration', 'Reconnaissance']),
            'confidence': random.randint(60, 99)
        })
    
    return jsonify({'events': events, 'correlations': correlations})

@analytics_bp.route('/threat-graph', methods=['GET'])
def get_threat_graph():
    """Get threat relationship graph data"""
    nodes = []
    edges = []
    
    # Create nodes
    for i in range(15):
        node_types = ['ip', 'domain', 'hash', 'url']
        nodes.append({
            'id': f'node_{i}',
            'type': random.choice(node_types),
            'label': f'threat_{i}',
            'x': random.uniform(-100, 100),
            'y': random.uniform(-100, 100),
            'attributes': {
                'first_seen': datetime.utcnow().isoformat(),
                'last_seen': datetime.utcnow().isoformat(),
                'occurrence': random.randint(1, 50)
            }
        })
    
    # Create edges
    for i in range(len(nodes) - 1):
        if random.random() > 0.5:
            edges.append({
                'source': nodes[i]['id'],
                'target': nodes[i+1]['id'],
                'relationship': random.choice(['related_to', 'connects_to', 'similar_to'])
            })
    
    return jsonify({'nodes': nodes, 'edges': edges})

@analytics_bp.route('/threats/list', methods=['GET'])
def get_threats_list():
    """Get list of threats for MITRE mapping"""
    iocs = [
        f'192.168.{random.randint(1, 255)}.{random.randint(1, 255)}'
        for _ in range(10)
    ]
    iocs.extend([
        f'{random.choice(["malicious", "evil", "phishing"])}{i}.com'
        for i in range(5)
    ])
    
    threats = [
        {'value': ioc, 'type': 'IP' if ioc.startswith('192') else 'Domain'}
        for ioc in iocs
    ]
    
    return jsonify(threats)

@analytics_bp.route('/mitre/map', methods=['POST'])
def map_to_mitre():
    """Map IOC/threat to MITRE ATT&CK framework"""
    data = request.json
    ioc = data.get('ioc')
    ioc_type = data.get('type', 'unknown')
    
    techniques = [
        {
            'id': 'T1566',
            'name': 'Phishing',
            'description': 'Sending phishing emails to gain initial access',
            'tactics': ['Initial Access'],
            'mitigation': 'Email filtering, user training'
        },
        {
            'id': 'T1059',
            'name': 'Command and Scripting Interpreter',
            'description': 'Using command line tools to execute code',
            'tactics': ['Execution'],
            'mitigation': 'Restrict script execution, application whitelisting'
        },
        {
            'id': 'T1105',
            'name': 'Ingress Tool Transfer',
            'description': 'Transfer tools into target network',
            'tactics': ['Command and Control'],
            'mitigation': 'Network segmentation, egress filtering'
        }
    ]
    
    return jsonify({
        'ioc': ioc,
        'type': ioc_type,
        'techniques': techniques,
        'risk_score': random.randint(60, 95),
        'detection_rate': random.randint(60, 99),
        'mitigations': [
            'Implement EDR solution',
            'Enable MFA for critical accounts',
            'Segment network',
            'Monitor DNS queries'
        ],
        'references': [
            'https://attack.mitre.org/techniques/T1566/',
            'https://attack.mitre.org/techniques/T1059/',
            'https://cisa.gov/guidelines'
        ]
    })

@analytics_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """Get dashboard metrics"""
    return jsonify({
        'total_threats': random.randint(500, 2000),
        'critical_threats': random.randint(5, 20),
        'api_health': random.randint(85, 99),
        'detection_rate': random.randint(75, 95),
        'avg_response_time': f'{random.randint(100, 500)}ms'
    })


