# Mohid Umer, M Ahsan, M Saim
# 23i-2130, 23i-2117, 23i-2119
# dashboard_routes.py

from flask import Blueprint, request, jsonify
from services.temporal_analysis import TemporalAnalysis
from services.graph_builder import GraphBuilder
from datetime import datetime, timedelta
import random

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/v1')

temp_analysis = TemporalAnalysis()
graph_builder = GraphBuilder()

@dashboard_bp.route('/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    """Get comprehensive dashboard summary"""
    return jsonify({
        'total_threats': random.randint(500, 2000),
        'critical': random.randint(5, 20),
        'high': random.randint(20, 80),
        'medium': random.randint(50, 150),
        'low': random.randint(100, 300),
        'detection_rate': random.randint(75, 95),
        'api_coverage': random.randint(85, 99),
        'last_updated': datetime.utcnow().isoformat()
    })

@dashboard_bp.route('/dashboard/real-time-stats', methods=['GET'])
def get_realtime_stats():
    """Get real-time statistics"""
    return jsonify({
        'active_threats': random.randint(10, 50),
        'processing_events': random.randint(100, 500),
        'api_calls_per_min': random.randint(500, 2000),
        'avg_response_time_ms': random.randint(50, 300),
        'system_uptime_hours': random.randint(24, 720),
        'timestamp': datetime.utcnow().isoformat()
    })
