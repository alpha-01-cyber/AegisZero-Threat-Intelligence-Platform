# Mohid Umer, M Ahsan, M Saim
# 23i-2130, 23i-2117, 23i-2119
# app.py

from flask import Flask, render_template, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, static_folder='frontend/out', static_url_path='', template_folder='frontend/out')
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Import blueprints
from routes.enrich_route import ioc_bp
from routes.analytics import analytics_bp
from routes.dashboard_routes import dashboard_bp
from routes.mitre_route import mitre_bp
from routes.threats_route import threats_bp
from routes.ai_route import ai_bp

# Register blueprints
app.register_blueprint(ioc_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(mitre_bp)
app.register_blueprint(threats_bp)
app.register_blueprint(ai_bp)

# Serve frontend
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/threats')
@app.route('/alerts')
@app.route('/iocs')
@app.route('/enrich')
@app.route('/analysis')
@app.route('/settings')
@app.route('/analytics')
@app.route('/network-map')
@app.route('/ioc-search')
@app.route('/reports')
@app.route('/timeline')
@app.route('/mitre')
@app.route('/graph-explorer')
def catch_all():
    return app.send_static_file('index.html')

@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'service': 'AegisZero Security Dashboard',
        'version': '2.0.0',
        'data_source': 'Real-time free threat intelligence',
        'environment': os.getenv('FLASK_ENV', 'production'),
        'free_services': [
            'ip-api.com',
            'ThreatFox by abuse.ch',
            'URLhaus by abuse.ch',
            'SSLBL by abuse.ch',
            'DNS/Reverse DNS',
            'IPQualityScore'
        ]
    })

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    host = os.getenv('HOST', '127.0.0.1')
    port = int(os.getenv('PORT', 5000))
    
    print(f"\n{'='*60}")
    print(f"  AegisZero Security Dashboard")
    print(f"{'='*60}")
    print(f"  Environment: {os.getenv('FLASK_ENV', 'production')}")
    print(f"  Server: http://{host}:{port}")
    print(f"  Frontend: http://localhost:3000")
    print(f"  Data Source: Real-time FREE threat intelligence")
    print(f"  API Keys Required: NONE (Optional)")
    print(f"{'='*60}\n")
    
    app.run(host=host, port=port, debug=debug_mode)
