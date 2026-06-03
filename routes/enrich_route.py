# Mohid Umer, M Ahsan, M Saim
# 23i-2130, 23i-2117, 23i-2119
# enrich_route.py

from flask import Blueprint, request, jsonify
from services.ingestion import validate_and_normalize_iocs
from services.enrichment import EnrichmentEngine
from services.geolocation import GeolocationService
from services.temporal_analysis import TemporalAnalysis
from services.api_quality import APIQualityEngine
from services.graph_builder import GraphBuilder
from services.impact_simulation import ImpactSimulator
from datetime import datetime

ioc_bp = Blueprint('ioc_bp', __name__, url_prefix='/api/v1')

# Initialize engines (singleton pattern)
enrichment_engine = EnrichmentEngine()
geo_service = GeolocationService()
temp_analysis = TemporalAnalysis()
api_quality = APIQualityEngine()
graph_builder = GraphBuilder()
impact_simulator = ImpactSimulator()

@ioc_bp.route('/enrich', methods=['POST'])
def enrich_route():
    """Enrich IOCs from multiple threat intelligence sources"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'No JSON data provided'}), 400

        iocs = data.get('iocs', [])

        valid, result = validate_and_normalize_iocs(iocs)
        if not valid:
            return jsonify({'status': 'error', 'message': result}), 400

        enriched_results = enrichment_engine.enrich_batch(result)
        results = []

        for enriched in enriched_results:
            value = enriched['value']
            ioc_type = enriched['type']

            # Get geolocation for IPs
            if ioc_type == 'ip':
                enriched['geolocation'] = geo_service.get_ip_location(value)

            # Calculate impact
            impact = impact_simulator.simulate_ioc_impact(value, ioc_type, enriched)
            
            # Generate chart data for visualization
            chart_data = impact_simulator.generate_chart_data(enriched)
            impact['chart_data'] = chart_data
            
            enriched['impact_analysis'] = impact

            # Log temporal event
            temp_analysis.add_ioc_event(value, 'enrichment_request')

            # Add to graph
            graph_builder.add_ioc(value, ioc_type)

            results.append(enriched)

        return jsonify({
            'status': 'success',
            'count': len(results),
            'results': results,
            'timestamp': datetime.utcnow().isoformat()
        })

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500



@ioc_bp.route('/graph', methods=['GET'])
def get_graph():
    """Get threat relationship graph data"""
    try:
        graph_builder.time_decay_edges()
        return jsonify(graph_builder.export_graph_json())
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@ioc_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """Get real-time threat metrics"""
    try:
        return jsonify({
            'total_iocs': len(graph_builder.graph.nodes()),
            'total_relationships': len(graph_builder.graph.edges()),
            'api_quality': api_quality.evaluate_all_apis(),
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@ioc_bp.route('/timeline', methods=['GET'])
def get_timeline():
    """Get timeline data for all IOCs"""
    try:
        timeline_data = {}
        for ioc_value in temp_analysis.history.keys():
            timeline = temp_analysis.get_timeline(ioc_value)
            timeline_data[ioc_value] = [
                {
                    'timestamp': event['timestamp'].isoformat(),
                    'source': event['source']
                }
                for event in timeline
            ]
        return jsonify(timeline_data)
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@ioc_bp.route('/simulate', methods=['POST'])
def simulate_iocs():
    """Simulate impact of IOCs on infrastructure"""
    try:
        data = request.get_json()
        iocs = data.get('iocs', [])

        valid, normalized_iocs = validate_and_normalize_iocs(iocs)
        if not valid:
            return jsonify({'status': 'error', 'message': normalized_iocs}), 400

        simulations = []
        for ioc in normalized_iocs:
            impact = impact_simulator.simulate_ioc_impact(ioc['value'], ioc['type'], {})
            simulations.append(impact)

        return jsonify({
            'status': 'success',
            'simulations': simulations,
            'timestamp': datetime.utcnow().isoformat()
        })

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@ioc_bp.route('/api-quality', methods=['GET'])
def get_api_quality():
    """Get API quality scores"""
    try:
        scores = api_quality.evaluate_all_apis()
        return jsonify(scores)
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
