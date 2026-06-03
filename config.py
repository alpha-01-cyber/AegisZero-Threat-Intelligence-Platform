# Mohid Umer, M Ahsan, M Saim
# 23i-2130, 23i-2117, 23i-2119
# config.py

"""Configuration for AegisZero Security Dashboard - NO API KEYS NEEDED"""
import os
from dotenv import load_dotenv

load_dotenv()

# Flask Settings
SECRET_KEY = os.getenv('SECRET_KEY', 'aegiszero-dev-key-change-in-production-12345')
DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'
HOST = os.getenv('HOST', '127.0.0.1')
PORT = int(os.getenv('PORT', 5000))

# Request Settings
REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', 10))
CACHE_TTL = int(os.getenv('CACHE_TTL', 3600))

# Free Services (NO API KEYS REQUIRED)
# These services work without any authentication:
# - ip-api.com: Free IP geolocation
# - ThreatFox: Free threat intelligence by abuse.ch
# - URLhaus: Free malicious URL database by abuse.ch
# - SSLBL: Free SSL blacklist by abuse.ch
# - DNS/Reverse DNS: Built-in Python socket library

print("✅ Configuration loaded - Using FREE real-time threat intelligence services")
print("📍 No API keys required - All data sources are completely free")
