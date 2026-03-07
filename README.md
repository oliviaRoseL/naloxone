# 🚨 NaloxoneNow

> **Connecting Canadians to life-saving naloxone — in seconds, not minutes.**

NaloxoneNow is an AI-powered emergency response platform that guides bystanders through opioid overdose situations in real time. It locates the nearest naloxone, walks users through administration with voice narration, and connects community volunteer responders to those in need — before paramedics arrive.

---

## 🇨🇦 The Problem

Canada faces one of the worst opioid crises in its history. In 2023 alone, over **21 people died every day** from apparent opioid toxicity. Naloxone (Narcan) reverses overdoses and is freely available at most Canadian pharmacies — but in a crisis moment, people don't know where to find it, don't know how to use it, and panic sets in.

**NaloxoneNow bridges that gap.**

---

## 🎯 What It Does

- **🗺️ Find Naloxone** — Instantly maps the nearest pharmacies, health units, and community distribution points carrying free naloxone kits across Canada
- **🎙️ Voice-Guided Response** — ElevenLabs AI narration calmly walks bystanders through overdose response step-by-step ("Roll them on their side. Tilt their head back. Now inject...")
- **🤖 AI Triage Assistant** — Gemini-powered chatbot answers urgent questions in plain language ("How do I know it's an overdose?", "What if they're breathing?")
- **👥 Community Responder Network** — Registered volunteers who carry naloxone can opt in to receive proximity alerts when someone nearby needs help
- **📊 Overdose Hotspot Intelligence** — Backboard.io multi-agent memory layer tracks anonymized response patterns to surface high-risk areas and pre-position community resources

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│         (Map UI · Voice Player · Chat)           │
└────────────────────┬────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────┐
│              FastAPI Backend (Python)            │
│                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────┐  │
│  │  Gemini API │  │ ElevenLabs   │  │ Auth0  │  │
│  │  (Triage AI)│  │ (Voice Guide)│  │ (Auth) │  │
│  └─────────────┘  └──────────────┘  └────────┘  │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │         Backboard.io Agent Layer            │ │
│  │  (Responder memory · Hotspot intelligence)  │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │      Health Canada Naloxone Location API    │ │
│  │       + OpenStreetMap / Google Maps         │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Leaflet.js (maps), Tailwind CSS |
| Backend | Python 3.11, FastAPI, Uvicorn |
| AI Triage | Google Gemini API |
| Voice Narration | ElevenLabs Text-to-Speech API |
| Auth | Auth0 (volunteer responder login) |
| Agent Memory | Backboard.io (multi-agent orchestration) |
| Naloxone Data | Health Canada harm reduction data + community scrapers |
| Geolocation | OpenStreetMap / Nominatim |
| Deployment | Uvicorn + static React build |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- API keys: Gemini, ElevenLabs, Auth0, Backboard.io

### Installation

```bash
# Clone the repo
git clone https://github.com/your-team/naloxonenow
cd naloxonenow

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env   # Fill in your API keys
uvicorn main:app --reload

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

### Environment Variables

```env
GEMINI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
AUTH0_DOMAIN=your_domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
BACKBOARD_API_KEY=your_key_here
```

---

## 📱 Key User Flows

### Flow 1: Emergency Bystander
1. Opens NaloxoneNow on mobile
2. Hits **"Someone is overdosing"** — no login required
3. Map shows nearest naloxone within seconds
4. ElevenLabs voice begins step-by-step narration
5. Gemini chatbot available for follow-up questions

### Flow 2: Community Volunteer Responder
1. Registers via Auth0 (one-time)
2. Marks themselves as "carrying naloxone" and active
3. Receives proximity alerts when emergencies are reported nearby
4. App navigates them to the scene

### Flow 3: Healthcare Worker / Admin
1. Views Backboard.io-powered hotspot map
2. Reviews anonymized overdose frequency by neighborhood
3. Uses data to target naloxone distribution outreach

---

## 🏆 Prize Track Eligibility

| Prize | How We Qualify |
|-------|---------------|
| **Vivirion Healthcare** | Practical Canadian healthcare tool supporting harm reduction workers and community responders |
| **Gemini API** | Gemini powers our real-time AI triage assistant for overdose guidance |
| **ElevenLabs** | Voice-guided overdose response narration — our core UX differentiator |
| **Backboard.io** | Multi-agent memory layer for community responder coordination and hotspot intelligence |
| **Auth0** | Volunteer responder authentication and session management |

---

## 🌍 Impact & Scalability

- **Immediate**: Faster access to naloxone and clearer guidance saves lives today
- **6 months**: Responder network scales to 10+ Canadian cities with community partnerships
- **Long-term**: Anonymized hotspot data informs public health policy and naloxone distribution decisions at a provincial level

---

## 👥 Team

Built with ❤️ at **Hack Canada 2026** — Waterloo, Ontario

---

## ⚠️ Disclaimer

NaloxoneNow is a decision-support tool. Always call 911 in an emergency. This application does not replace professional medical advice or emergency services.