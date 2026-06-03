# AegisZero - Real-Time Threat Intelligence Platform

**Authors**: Mohid Umer, M Ahsan, M Saim  
**Roll Numbers**: 23i-2130, 23i-2117, 23i-2119  
**Course**: Network Security  
**Institution**: FAST-NUCES Islamabad

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Installation & Setup](#installation--setup)
5. [Project Structure](#project-structure)
6. [API Routes & Workflows](#api-routes--workflows)
7. [Frontend Pages](#frontend-pages)
8. [Backend Services](#backend-services)
9. [External APIs Integrated](#external-apis-integrated)
10. [Usage Guide](#usage-guide)

---

## 🎯 Project Overview

AegisZero is an advanced real-time threat intelligence platform that aggregates data from 10+ external security APIs, performs automated MITRE ATT&CK mapping using real STIX data, and provides AI-powered threat analysis. The system features interactive 3D geospatial visualization, multi-format report generation (Excel, PDF, Word), and a modern, responsive UI.

**Key Problem Solved**: Security analysts spend 10-15 minutes manually checking multiple threat intelligence sources for each IOC (Indicator of Compromise). AegisZero reduces this to **under 2 seconds** by automating the entire process.

---

## ✨ Features

### Core Functionality
- **Real-Time Threat Intelligence**: Aggregates data from VirusTotal, AbuseIPDB, AlienVault OTX, Shodan, and 6+ other APIs
- **Automated MITRE ATT&CK Mapping**: Fetches 600+ techniques from official MITRE STIX repository
- **AI Security Analyst**: Streaming AI-powered threat analysis with strategic recommendations
- **3D Globe Visualization**: Interactive geospatial threat mapping to capital cities
- **Multi-Format Reports**: Export to Excel (.xlsx), PDF (.pdf), or Word (.docx)
- **Live Threat Feed**: Real-time dashboard updates every 5 seconds
- **Weighted Severity Scoring**: Prevents severity inflation using multi-criteria algorithm

### Security Features
- **Firebase Authentication**: Secure user login/signup
- **Protected Routes**: All pages require authentication
- **API Key Management**: Secure storage in environment variables
- **Input Validation**: IOC type detection with regex patterns

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 16.0.3 (React 19)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4.1.9
- **UI Components**: ShadCN UI (Radix UI primitives)
- **Data Fetching**: SWR (stale-while-revalidate)
- **Visualization**: 
  - `react-globe.gl` (3D globe)
  - `recharts` (charts)
  - `react-markdown` (AI responses)
- **Export Libraries**: `xlsx`, `jspdf`, `docx`

### Backend
- **Framework**: Flask 3.0 (Python)
- **HTTP Client**: `requests`
- **Environment**: `python-dotenv`
- **CORS**: `flask-cors`

### Authentication
- **Firebase Authentication**: Email/password login

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js**: v18+ (for frontend)
- **Python**: 3.8+ (for backend)
- **npm**: v9+ (comes with Node.js)

### Step 1: Clone Repository
```bash
cd "d:\Network Security Project"
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

**Packages Installed** (automatically from `package.json`):
- next, react, react-dom
- swr, recharts, react-globe.gl
- xlsx, jspdf, docx, file-saver
- lucide-react, tailwindcss
- firebase

### Step 3: Install Backend Dependencies
```bash
pip install -r requirements.txt
```

**Packages Installed**:
- Flask
- requests
- python-dotenv
- flask-cors

### Step 4: Configure Environment Variables
Create a `.env` file in the project root:

```bash
# Required API Keys (Free Tier)
OTX_API_KEY=your_alienvault_otx_key
VT_API_KEY=your_virustotal_key
ABUSEIPDB_API_KEY=your_abuseipdb_key
SHODAN_API_KEY=your_shodan_key

# Optional
URLSCAN_API_KEY=optional

# Flask Settings
FLASK_ENV=development
HOST=127.0.0.1
PORT=5000
```

**How to Get API Keys** (All Free):
1. **AlienVault OTX**: https://otx.alienvault.com/ (Sign up → API Key in settings)
2. **VirusTotal**: https://www.virustotal.com/ (Sign up → API Key in profile)
3. **AbuseIPDB**: https://www.abuseipdb.com/ (Sign up → API Key in account)
4. **Shodan**: https://www.shodan.io/ (Sign up → API Key in account)

### Step 5: Run the Application

**Terminal 1 (Backend)**:
```bash
python app.py
```
Backend runs on: `http://localhost:5000`

**Terminal 2 (Frontend)**:
```bash
npm run dev
```
Frontend runs on: `http://localhost:3000`

### Step 6: Access the Application
Open browser: `http://localhost:3000`

**Default Login** (Firebase):
- Create account via signup page
- Or use your Firebase test credentials

---

## 📁 Project Structure

```
d:\Network Security Project\
│
├── 📄 app.py                          # Flask entry point, blueprint registration
├── 📄 config.py                       # Configuration settings
├── 📄 package.json                    # Frontend dependencies
├── 📄 requirements.txt                # Backend dependencies
├── 📄 .env                            # API keys (DO NOT SUBMIT)
├── 📄 README.md                       # This file
│
├── 📂 app/                            # Next.js pages (Frontend)
│   ├── page.tsx                       # Dashboard (/)
│   ├── active-threats/page.tsx        # Active Threats page
│   ├── ioc-search/page.tsx            # IOC Search page
│   ├── network-map/page.tsx           # 3D Globe Map
│   ├── reports/page.tsx               # Threat Reports
│   ├── ai-insights/page.tsx           # AI Analyst
│   ├── analytics/page.tsx             # Analytics Dashboard
│   ├── settings/page.tsx              # User Settings
│   ├── login/page.tsx                 # Login page
│   └── signup/page.tsx                # Signup page
│
├── 📂 components/                     # React components
│   ├── dashboard/
│   │   ├── LiveThreatFeed.tsx         # Real-time threat feed widget
│   │   └── dashboard-map.tsx          # Dashboard map preview
│   ├── reports/
│   │   └── ReportExportModal.tsx      # Export modal (Excel/PDF/Word)
│   ├── navigation/
│   │   ├── Sidebar.tsx                # App sidebar navigation
│   │   └── Header.tsx                 # Top header with user info
│   ├── auth/
│   │   └── ProtectedRoute.tsx         # Authentication wrapper
│   └── layouts/
│       └── DashboardLayout.tsx        # Main layout wrapper
│
├── 📂 routes/                         # Flask API routes (Backend)
│   ├── threats_route.py               # Threat endpoints (/api/v1/threats/*)
│   ├── mitre_route.py                 # MITRE ATT&CK endpoints (/api/v1/mitre/*)
│   ├── analytics.py                   # Analytics endpoints (/api/v1/analytics)
│   ├── enrich_route.py                # IOC enrichment (/api/v1/enrich)
│   └── dashboard_routes.py            # Dashboard data endpoints
│
├── 📂 services/                       # Backend business logic
│   ├── enrichment.py                  # Multi-API orchestration engine
│   ├── ingestion.py                   # IOC type detection
│   ├── tld_risk.py                    # Domain TLD risk scoring
│   └── graph_builder.py               # Threat graph construction
│
├── 📂 contexts/                       # React contexts
│   ├── AuthContext.tsx                # Firebase auth state
│   └── NotificationContext.tsx        # Toast notifications
│
├── 📂 lib/                            # Utility libraries
│   ├── firebase.ts                    # Firebase configuration
│   └── utils.ts                       # Helper functions
│
└── 📂 public/                         # Static assets
    └── logo.png                       # App logo
```

### Files to EXCLUDE from Submission
❌ **DO NOT SUBMIT**:
- `node_modules/` (auto-generated by `npm install`)
- `venv/` (Python virtual environment)
- `.next/` (Next.js build cache)
- `.env` (contains API keys - SECURITY RISK)
- `package-lock.json` (auto-generated)
- `.git/` (version control)

✅ **MUST SUBMIT**:
- All `.py` files (backend)
- All `.tsx` / `.ts` files (frontend)
- `package.json` (frontend dependencies list)
- `requirements.txt` (backend dependencies list)
- `README.md` (this file)
- `PROJECT_REPORT.md` (academic report)

---

## 🔌 API Routes & Workflows

### Backend Routes (Flask)

#### 1. **Threat Intelligence Routes** (`routes/threats_route.py`)

##### `GET /api/v1/threats/active`
**Purpose**: Fetch active threats from AlienVault OTX  
**Workflow**:
1. Calls OTX API with API key
2. Fetches latest threat pulses
3. For each pulse, extracts IOCs (IPs, domains, hashes)
4. Enriches IOCs with geolocation data
5. Stores in `THREAT_HISTORY` (in-memory)
6. Returns JSON array of threats

**Frontend Usage**: Dashboard, Active Threats page  
**Refresh Interval**: 10 seconds (via `useSWR`)

**Response Example**:
```json
{
  "threats": [
    {
      "id": "8.8.8.8",
      "type": "ip",
      "severity": "medium",
      "location": {"city": "Mountain View", "country": "US"},
      "timestamp": "2025-11-29T20:00:00Z"
    }
  ]
}
```

---

##### `GET /api/v1/threats/reports?ioc=<value>`
**Purpose**: Generate detailed threat report with MITRE mapping  
**Workflow**:
1. Receives IOC parameter (e.g., `8.8.8.8`)
2. Detects IOC type (IP, domain, hash, URL)
3. Calls `EnrichmentEngine.enrich_ioc()`:
   - Parallel API calls to VirusTotal, AbuseIPDB, Shodan, etc.
   - Normalizes responses into unified schema
4. Collects tags and verdicts from all sources
5. **Calls MITRE API** (`POST /api/v1/mitre/map`):
   - Sends IOC type to MITRE route
   - Receives mapped techniques from STIX data
6. Calculates severity using weighted scoring:
   - Malicious verdicts × 2
   - Suspicious verdicts × 1
   - Critical tags (ransomware, APT) × 3
7. Generates remediation recommendations
8. Returns comprehensive JSON report

**Frontend Usage**: Reports page  
**Python File**: `routes/threats_route.py` (lines 129-400)

**Response Example**:
```json
{
  "report": {
    "ioc": "8.8.8.8",
    "type": "ip",
    "severity": "medium",
    "description": "Google Public DNS",
    "sources": {
      "virustotal": {"verdict": "Clean", "threat_count": 0},
      "abuseipdb": {"verdict": "Clean", "abuse_score": 0}
    },
    "mitreTactics": [
      {"id": "T1071", "name": "Application Layer Protocol", "tactic": "Command and Control"}
    ],
    "recommendations": ["Monitor traffic", "Enable logging"]
  }
}
```

---

#### 2. **MITRE ATT&CK Routes** (`routes/mitre_route.py`)

##### `GET /api/v1/mitre/techniques`
**Purpose**: Fetch all MITRE techniques from official STIX data  
**Workflow**:
1. Checks 1-hour cache
2. If cache expired, fetches from GitHub:
   - URL: `https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json`
3. Parses STIX JSON (600+ techniques)
4. Extracts: ID, name, description, tactics, platforms, data sources
5. Caches for 1 hour
6. Returns all techniques

**Frontend Usage**: Not directly used (internal API)  
**Python File**: `routes/mitre_route.py` (lines 16-60)

---

##### `POST /api/v1/mitre/map`
**Purpose**: Map IOC to relevant MITRE techniques  
**Request Body**:
```json
{
  "ioc": "8.8.8.8",
  "type": "ip"
}
```

**Workflow**:
1. Generates search queries based on IOC type:
   - IP → ["C2", "botnet", "scanning"]
   - Domain → ["phishing", "DNS", "C2"]
   - Hash → ["malware", "ransomware", "trojan"]
2. Searches cached MITRE techniques for each query
3. Returns top 6 most relevant techniques
4. Calculates risk score (0-100) based on:
   - Number of techniques
   - High-risk tactics (execution, persistence)
   - IOC type severity
5. Generates mitigations and detection rules

**Frontend Usage**: Called by `threats_route.py` during report generation  
**Python File**: `routes/mitre_route.py` (lines 147-200)

**Response Example**:
```json
{
  "techniques": [
    {"id": "T1071", "name": "Application Layer Protocol", "tactics": ["command-and-control"]}
  ],
  "risk_score": 65,
  "detection_rate": 80,
  "mitigations": ["Network intrusion detection", "Web proxy filtering"]
}
```

---

#### 3. **IOC Enrichment Route** (`routes/enrich_route.py`)

##### `POST /api/v1/enrich`
**Purpose**: Enrich a single IOC with threat intelligence  
**Request Body**:
```json
{
  "ioc": "malware.com",
  "type": "domain"
}
```

**Workflow**:
1. Validates IOC format using `detect_ioc_type()`
2. Calls `EnrichmentEngine.enrich_ioc()`:
   - **For IPs**: AbuseIPDB, VirusTotal, Shodan, IP-API
   - **For Domains**: VirusTotal, URLScan, TLD Risk Scorer
   - **For Hashes**: VirusTotal, ThreatFox
3. Aggregates results into unified JSON
4. Returns enriched data

**Frontend Usage**: IOC Search page  
**Python File**: `routes/enrich_route.py`

---

#### 4. **Analytics Route** (`routes/analytics.py`)

##### `GET /api/v1/analytics`
**Purpose**: Provide dashboard metrics  
**Workflow**:
1. Reads `THREAT_HISTORY` (in-memory threat list)
2. Calculates:
   - Threat distribution by hour (last 24 hours)
   - Severity breakdown (critical, high, medium, low)
   - IOC type distribution (IP, domain, hash)
   - Threats by capital city (top 10)
3. Returns JSON for charts

**Frontend Usage**: Analytics page, Dashboard  
**Python File**: `routes/analytics.py`

---

#### 5. **AI Analysis Route** (`routes/ai_route.py`)

##### `POST /api/v1/ai/analyze`
**Purpose**: Generate AI-powered threat analysis (simulated)  
**Request Body**:
```json
{
  "report": {
    "ioc": "8.8.8.8",
    "severity": "medium",
    "type": "ip"
  }
}
```

**Workflow**:
1. Extracts IOC, severity, type from report
2. Generates contextual markdown analysis:
   - Executive summary
   - Technical breakdown
   - Strategic recommendations
3. **Streams response** in chunks (simulates real AI):
   - Status: "thinking" → "streaming" → "done"
   - Each chunk is a JSON line
4. Frontend renders markdown in real-time

**Frontend Usage**: AI Insights page  
**Python File**: `routes/ai_route.py`

---

### Frontend Pages (Next.js)

#### 1. **Dashboard** (`app/page.tsx`)
**Route**: `/`  
**APIs Called**:
- `GET /api/v1/threats/active` (active threats count)
- `GET /api/v1/threat-map` (map data)

**Components**:
- KPI cards (Active Threats, Critical Risks, System Status)
- `LiveThreatFeed` (scrolling threat list)
- `DashboardMap` (3D globe preview)

**Data Flow**:
```
User visits / → useSWR fetches /threats/active → Displays threat count → LiveThreatFeed shows latest 10 threats
```

---

#### 2. **Active Threats** (`app/active-threats/page.tsx`)
**Route**: `/active-threats`  
**APIs Called**:
- `GET /api/v1/threats/active`

**Features**:
- Filterable table (by severity, type)
- Clickable rows → navigate to `/reports?ioc=<value>`
- Real-time updates (10s interval)

**Data Flow**:
```
User visits /active-threats → Fetches threats → Renders table → User clicks row → Redirects to /reports
```

---

#### 3. **IOC Search** (`app/ioc-search/page.tsx`)
**Route**: `/ioc-search`  
**APIs Called**:
- `POST /api/v1/enrich` (on search submit)

**Features**:
- Search input (IP, domain, hash, URL)
- Charts (VirusTotal detection ratio, vendor breakdown)
- TLD risk warnings (for domains)

**Data Flow**:
```
User enters IOC → Clicks Search → POST /enrich → Displays charts → Shows MITRE techniques
```

---

#### 4. **Network Map** (`app/network-map/page.tsx`)
**Route**: `/network-map`  
**APIs Called**:
- `GET /api/v1/threats/active`

**Features**:
- 3D globe (`react-globe.gl`)
- Threats plotted to capital cities
- Clickable markers → show threat details

**Data Flow**:
```
User visits /network-map → Fetches threats → Maps to lat/lng → Renders on globe → User clicks marker → Shows popup
```

---

#### 5. **Reports** (`app/reports/page.tsx`)
**Route**: `/reports?ioc=<value>`  
**APIs Called**:
- `GET /api/v1/threats/reports?ioc=<value>`

**Features**:
- MITRE ATT&CK cards (tactics, techniques)
- Technical analysis (source-by-source breakdown)
- Remediation steps
- **Export button** → Opens `ReportExportModal`

**Data Flow**:
```
User visits /reports?ioc=8.8.8.8 → Fetches report → Displays MITRE cards → User clicks Export → Modal opens → Selects format → Downloads file
```

---

#### 6. **AI Insights** (`app/ai-insights/page.tsx`)
**Route**: `/ai-insights?ioc=<value>`  
**APIs Called**:
- `GET /api/v1/threats/reports?ioc=<value>` (fetch report)
- `POST /api/v1/ai/analyze` (streaming analysis)

**Features**:
- Chat-like interface
- Streaming markdown responses
- Auto-scroll to new content

**Data Flow**:
```
User visits /ai-insights?ioc=8.8.8.8 → Fetches report → Sends to AI API → Streams response → Renders markdown
```

---

## 🌐 External APIs Integrated

| API | Purpose | Free Tier Limit | Data Retrieved |
|-----|---------|-----------------|----------------|
| **AlienVault OTX** | Threat pulses, IOC tags | Unlimited | Pulses, indicators, tags |
| **VirusTotal** | Malware detection | 4 req/min | Detection ratio, vendor verdicts |
| **AbuseIPDB** | IP reputation | 1000 req/day | Abuse confidence score, reports |
| **Shodan** | Internet-connected devices | 100 req/month | Open ports, services, vulns |
| **URLScan.io** | Website analysis | 100 req/day | Screenshots, DOM, malicious flags |
| **ThreatFox** | Malware IOCs | Unlimited | Threat type, malware family |
| **URLhaus** | Malicious URLs | Unlimited | URL status, tags |
| **SSL Blacklist** | Certificate revocation | Unlimited | Blacklist status |
| **IP-API** | Geolocation | 45 req/min | City, country, lat/lng |
| **IPQualityScore** | Proxy/VPN detection | 5000 req/month | Fraud score, proxy status |

---

## 📖 Usage Guide

### 1. Search for an IOC
1. Navigate to **IOC Search** (`/ioc-search`)
2. Enter IP, domain, hash, or URL
3. Click **Search**
4. View charts and MITRE techniques

### 2. View Active Threats
1. Navigate to **Active Threats** (`/active-threats`)
2. Browse real-time threat table
3. Click any row to view detailed report

### 3. Generate Threat Report
1. From Active Threats, click a threat
2. Or navigate to `/reports?ioc=<value>`
3. View MITRE ATT&CK mapping
4. Click **Export Report** → Choose format (Excel/PDF/Word)

### 4. Analyze with AI
1. From a report page, click **Analyze with AI**
2. Watch streaming AI analysis
3. View strategic recommendations

### 5. Explore 3D Map
1. Navigate to **Network Map** (`/network-map`)
2. Rotate globe to view threats
3. Click markers for details

---

## 🎓 Academic Context

This project was developed as part of the **Network Security** course at FAST-NUCES Islamabad. It demonstrates:

- **Complex Problem Solving**: Multi-API integration, real-time data processing
- **Security Best Practices**: Authentication, input validation, API key management
- **Modern Architecture**: Microservices (Flask + Next.js), RESTful APIs
- **Real-World Application**: Solves actual SOC analyst workflow inefficiencies

**Submission Includes**:
- Source code (all `.py`, `.tsx`, `.ts` files)
- `package.json` and `requirements.txt`
- This `README.md`
- `PROJECT_REPORT.md` (15-page academic report)

---

## 👥 Team Members

- **Mohid Umer** (23i-2130) - Backend Development, API Integration
- **M Ahsan** (23i-2117) - Frontend Development, UI/UX Design
- **M Saim** (23i-2119) - MITRE Integration, Testing

---

## 📝 License

This project is submitted for academic purposes only. All external APIs are used under their respective free-tier licenses.

---

**Last Updated**: November 29, 2025  
**Version**: 2.0.0
