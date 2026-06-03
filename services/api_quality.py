"""API Quality Assessment Service"""
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, Any

class APIQualityEngine:
    def __init__(self):
        self.api_metrics = defaultdict(lambda: {
            'total_calls': 0,
            'successful_calls': 0,
            'failed_calls': 0,
            'rate_limited': 0,
            'avg_response_time': 0,
            'last_updated': None
        })
        self.response_times = defaultdict(list)
    
    def record_api_call(self, api_name: str, success: bool, response_time: float, status_code: int = 200):
        """Record an API call for quality tracking"""
        metrics = self.api_metrics[api_name]
        metrics['total_calls'] += 1
        
        if success:
            metrics['successful_calls'] += 1
        else:
            metrics['failed_calls'] += 1
        
        if status_code == 429:
            metrics['rate_limited'] += 1
        
        self.response_times[api_name].append(response_time)
        
        # Calculate average response time (last 100 calls)
        recent_times = self.response_times[api_name][-100:]
        metrics['avg_response_time'] = sum(recent_times) / len(recent_times)
        metrics['last_updated'] = datetime.utcnow()
    
    def get_api_quality_score(self, api_name: str) -> float:
        """Calculate quality score for an API (0-100)"""
        metrics = self.api_metrics[api_name]
        
        if metrics['total_calls'] == 0:
            return 0.0
        
        # Success rate (0-40 points)
        success_rate = metrics['successful_calls'] / metrics['total_calls']
        success_score = success_rate * 40
        
        # Response time score (0-30 points) - lower is better
        avg_time = metrics['avg_response_time']
        if avg_time == 0:
            time_score = 30
        elif avg_time < 0.5:
            time_score = 30
        elif avg_time < 1.0:
            time_score = 25
        elif avg_time < 2.0:
            time_score = 20
        elif avg_time < 5.0:
            time_score = 10
        else:
            time_score = 5
        
        # Rate limit score (0-30 points)
        if metrics['total_calls'] > 0:
            rate_limit_rate = metrics['rate_limited'] / metrics['total_calls']
            rate_limit_score = max(0, 30 - (rate_limit_rate * 100))
        else:
            rate_limit_score = 30
        
        return round(success_score + time_score + rate_limit_score, 2)
    
    def evaluate_all_apis(self) -> Dict[str, Any]:
        """Evaluate quality for all tracked APIs"""
        results = {}
        
        api_names = ['OTX', 'AbuseIPDB', 'VirusTotal', 'URLScan', 'IPQuality', 'Shodan']
        
        for api_name in api_names:
            if api_name in self.api_metrics:
                metrics = self.api_metrics[api_name]
                results[api_name] = {
                    'quality_score': self.get_api_quality_score(api_name),
                    'total_calls': metrics['total_calls'],
                    'success_rate': round((metrics['successful_calls'] / max(metrics['total_calls'], 1)) * 100, 2),
                    'avg_response_time': round(metrics['avg_response_time'], 3),
                    'rate_limited': metrics['rate_limited'],
                    'status': 'healthy' if self.get_api_quality_score(api_name) >= 70 else 'degraded'
                }
            else:
                results[api_name] = {
                    'quality_score': 0,
                    'total_calls': 0,
                    'success_rate': 0,
                    'avg_response_time': 0,
                    'rate_limited': 0,
                    'status': 'no_data'
                }
        
        return results
    
    def get_coverage_analysis(self) -> Dict:
        """Analyze coverage across multiple APIs"""
        total_apis = len(self.api_metrics)
        active_apis = sum(1 for metrics in self.api_metrics.values() if metrics['total_calls'] > 0)
        
        return {
            'total_apis': total_apis,
            'active_apis': active_apis,
            'coverage_percentage': round((active_apis / max(total_apis, 1)) * 100, 2)
        }
