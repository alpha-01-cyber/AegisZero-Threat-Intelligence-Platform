import os
from dotenv import load_dotenv

load_dotenv()

# API Keys (from environment variables)
OTX_API_KEY = os.getenv('OTX_API_KEY', '')
ABUSEIPDB_API_KEY = os.getenv('ABUSEIPDB_API_KEY', '')
VT_API_KEY = os.getenv('VT_API_KEY', '')
URLSCAN_API_KEY = os.getenv('URLSCAN_API_KEY', '')
SHODAN_API_KEY = os.getenv('SHODAN_API_KEY', '')
MAXMIND_LICENSE = os.getenv('MAXMIND_LICENSE', '')

# API Base URLs
OTX_BASE_URL = "https://otx.alienvault.com/api/v1/pulses/subscribed"
ABUSEIPDB_BASE_URL = "https://api.abuseipdb.com/api/v2/check"
VT_BASE_URL = "https://www.virustotal.com/api/v3"
URLSCAN_BASE_URL = "https://urlscan.io/api/v1/scan"
SHODAN_BASE_URL = "https://api.shodan.io"
GEOIP_BASE_URL = "https://geoip.maxmind.com"

# Request configuration
REQUEST_TIMEOUT = 10
MAX_IOCS_PER_REQUEST = 100
ALLOWED_IOC_TYPES = ['ip', 'domain', 'url', 'hash', 'email']

# Cache settings
CACHE_TTL = 3600  # 1 hour
GRAPH_DECAY_FACTOR = 0.95
GRAPH_MAX_AGE_HOURS = 168

# Database settings (optional, for persistence)
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', 5432)
DB_USER = os.getenv('DB_USER', 'aegis')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'aegiszero')
