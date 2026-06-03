import requests
from datetime import datetime

class GeolocationService:
    def __init__(self):
        self.geoip_cache = {}
    
    def get_ip_location(self, ip_address):
        """Get geolocation data for an IP address using FREE ip-api.com"""
        if ip_address in self.geoip_cache:
            return self.geoip_cache[ip_address]
        
        try:
            response = requests.get(
                f'http://ip-api.com/json/{ip_address}',
                params={'fields': 'status,country,countryCode,region,regionName,city,lat,lon,isp,org,as,mobile,proxy,hosting'},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'success':
                    result = {
                        'country': data.get('country'),
                        'country_code': data.get('countryCode'),
                        'region': data.get('region'),
                        'city': data.get('city'),
                        'latitude': data.get('lat'),
                        'longitude': data.get('lon'),
                        'isp': data.get('isp'),
                        'organization': data.get('org'),
                        'asn': data.get('as'),
                        'is_proxy': data.get('proxy', False),
                        'is_hosting': data.get('hosting', False),
                        'is_mobile': data.get('mobile', False)
                    }
                    self.geoip_cache[ip_address] = result
                    return result
        except Exception as e:
            print(f"Geolocation error for {ip_address}: {str(e)}")
            return {'error': str(e)}
        
        return None

    def get_threat_map_data(self, threat_locations):
        """Generate map data for threat visualization"""
        map_data = {
            'threats': [],
            'timestamp': datetime.utcnow().isoformat()
        }
        
        for threat in threat_locations:
            if 'latitude' in threat and 'longitude' in threat:
                map_data['threats'].append({
                    'id': threat.get('id'),
                    'latitude': threat['latitude'],
                    'longitude': threat['longitude'],
                    'severity': threat.get('severity', 'medium'),
                    'type': threat.get('type'),
                    'location': threat.get('city', threat.get('country', 'Unknown')),
                    'ioc': threat.get('ioc'),
                    'timestamp': threat.get('timestamp')
                })
        
        return map_data

    def enrich_ip_batch(self, ip_addresses):
        """Enrich multiple IPs with geolocation data"""
        results = []
        for ip in ip_addresses:
            location = self.get_ip_location(ip)
            if location:
                results.append({
                    'ip': ip,
                    'location': location
                })
        return results
