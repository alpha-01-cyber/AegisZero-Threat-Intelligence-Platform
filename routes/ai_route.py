# Mohid Umer, M Ahsan, M Saim
# 23i-2130, 23i-2117, 23i-2119
# ai_route.py

from flask import Blueprint, request, jsonify, Response, stream_with_context
import time
import json
import random

ai_bp = Blueprint('ai_bp', __name__, url_prefix='/api/v1/ai')

@ai_bp.route('/analyze', methods=['POST'])
def analyze_threat():
    """
    Analyze threat report using AI (Simulated for now).
    Accepts JSON report data and streams back a markdown analysis.
    """
    data = request.json
    report = data.get('report', {})
    
    ioc = report.get('ioc', 'Unknown IOC')
    threat_type = report.get('type', 'unknown')
    severity = report.get('severity', 'low')
    
    def generate_analysis():
        # Simulated "Thinking" delay
        yield json.dumps({"status": "thinking", "message": "Analyzing threat vectors..."}) + "\n"
        time.sleep(1.0)
        
        yield json.dumps({"status": "thinking", "message": "Cross-referencing with global threat intelligence..."}) + "\n"
        time.sleep(1.0)
        
        yield json.dumps({"status": "thinking", "message": "Generating strategic recommendations..."}) + "\n"
        time.sleep(1.0)

        # Generate the Markdown Report
        intro = f"""
## 🤖 AI Security Analysis: {ioc}

**Verdict**: **{severity.upper()}** | **Type**: {threat_type.upper()}

### Executive Summary
Based on the provided telemetry and intelligence feeds, this indicator ({ioc}) represents a **{severity} risk** to the organization. 
"""
        if severity == 'critical' or severity == 'high':
            intro += "Immediate containment is recommended. The pattern of activity suggests a targeted attack or active malware propagation."
        else:
            intro += "While not critical, this indicator shows suspicious characteristics that warrant monitoring."

        yield json.dumps({"status": "streaming", "chunk": intro}) + "\n"
        time.sleep(0.5)

        # Technical Breakdown
        tech_section = f"""
### Technical Breakdown
*   **Attack Vector**: The {threat_type} is likely being used for {random.choice(['Command & Control (C2)', 'Credential Harvesting', 'Malware Delivery', 'Reconnaissance'])}.
*   **Confidence**: High (Confirmed by multiple sources).
*   **MITRE ATT&CK Context**: The observed behaviors align with **Initial Access** and **Defense Evasion** tactics.
"""
        yield json.dumps({"status": "streaming", "chunk": tech_section}) + "\n"
        time.sleep(0.8)

        # Strategic Recommendations
        rec_section = """
### Strategic Recommendations
1.  **Immediate Action**: Block traffic to/from `{ioc}` at the perimeter firewall.
2.  **Investigation**: Query SIEM logs for any past connections to this indicator (last 30 days).
3.  **Hardening**: Ensure endpoint protection (EDR) signatures are up to date.
4.  **User Awareness**: If this is a phishing domain, alert employees to be vigilant against suspicious emails.

### AI Conclusion
This threat is active and evolving. Automated remediation is advised.
"""
        yield json.dumps({"status": "streaming", "chunk": rec_section}) + "\n"
        
        yield json.dumps({"status": "done"}) + "\n"

    return Response(stream_with_context(generate_analysis()), mimetype='application/x-ndjson')
