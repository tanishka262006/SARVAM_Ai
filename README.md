# 🇮🇳 Sarkari Sahayak (सरकारी सहायक)
### Multilingual AI Government Scheme Assistant Powered by Sarvam AI

> *"Government schemes samajhna aur apply karna ab simple hai."*

**Sarkari Sahayak** is a voice-first, multilingual AI assistant built specifically for Indian citizens. It bridges the gap between complex government welfare policies and ordinary citizens by combining **Sarvam AI’s Indian-language foundation models** with a **deterministic eligibility engine**.

---

## 🌟 Key Features

1. **🎙 Voice-First Interaction (Saaras STT)**
   - Speak naturally in **Hindi**, **Marathi**, **English**, or **Hinglish** (code-mixed speech like *"Meri family ki income 2 lakh hai aur mere do bachche hain"*).
   - Real-time animated waveform, recording state indicator, pause, replay, and stop controls.

2. **🧠 Conversational Reasoning & Progressive Inquiry (Sarvam-105B)**
   - The assistant **does not immediately guess or dump schemes**.
   - It empathetically asks targeted, progressive follow-up questions (e.g. *"Aap kis rajya mein rehte hain?"*, *"Bachchon ki umra kya hai?"*, *"Kya aapke paas income certificate hai?"*).
   - Generates simple, jargon-free explanations for any scheme at the tap of a button.

3. **📄 Government Document Intelligence (Sarvam Vision)**
   - Upload official documents (**PDF, JPG, JPEG, PNG**) such as Income Certificates, Aadhaar Cards, Ration Cards, and Caste Certificates.
   - Extracts structured fields: applicant name, annual income, certificate number, issuing authority, and issue date.
   - Cross-verifies document details against the citizen's profile to flag potential inconsistencies before updating.

4. **🔊 Natural Indian Voice Synthesis (Bulbul TTS)**
   - Responses and scheme summaries are automatically converted into natural, expressive speech in Indian accents (Hindi, Marathi, English).
   - Complete browser audio player controls: auto-play, pause, resume, replay, and stop.

5. **🎯 Deterministic Eligibility Matcher (Zero LLM Hallucinations)**
   - LLMs understand conversation and extract facts, but **all scheme qualification calculations are performed by deterministic, rule-based algorithms**.
   - Classifies schemes into:
     - 🟢 **High Eligibility** (Matches all strict requirements)
     - 🟡 **Possible Eligibility** (Missing documentation or partial information)
     - 🔴 **Not Eligible** (Strict criteria not met)
   - Clear breakdown of *Why you qualify*, *Missing requirements*, *Required documents*, and *Step-by-step application guides*.

6. **⚡ 1-Click Interactive Demo Mode**
   - Pre-loaded citizen profile: **Ramesh Kumar** (38 years old, Pune, Maharashtra, Delivery worker, ₹2,00,000 annual income, 2 children).
   - Test instant scheme discovery, demo document extraction (Tahsildar Income Certificate), and voice explanations with a single click.

---

## 🏛 Supported Government Schemes (Database of 12 Realistic Schemes)

| Scheme | Category | Benefit |
| :--- | :--- | :--- |
| **PM-SYM (Pradhan Mantri Shram Yogi Maan-dhan)** | Pension | ₹3,000 / month guaranteed pension for gig & unorganised workers |
| **PM SVANidhi** | Livelihood / Credit | ₹10,000 to ₹50,000 collateral-free working capital loan |
| **Ayushman Bharat (PM-JAY)** | Healthcare | ₹5,00,000 / year cashless health cover per family |
| **PM-KISAN** | Agriculture | ₹6,000 / year direct income transfer to farmers |
| **Mukhyamantri Majhi Ladki Bahin Yojana** | Women Empowerment | ₹1,500 / month direct bank deposit (Maharashtra) |
| **PM Awas Yojana (PMAY-G/U)** | Housing | ₹1.2 Lakh to ₹2.5 Lakh subsidy for pucca house |
| **Sukanya Samriddhi Yojana (SSY)** | Girl Child Welfare | 8.2% tax-free compound interest savings for daughter |
| **PM Ujjwala Yojana 2.0** | Energy / LPG | Free LPG cylinder, gas stove & ₹300/refill subsidy |
| **Sanjay Gandhi Niradhar Anudan Yojana** | Social Security | ₹1,500 / month for destitute/disabled citizens (Maharashtra) |
| **National Pre/Post-Matric Scholarship** | Education | Up to ₹12,000 / year tuition fee & maintenance for students |
| **PM Surya Ghar: Muft Bijli Yojana** | Clean Energy | Up to 300 units free solar power + up to ₹78,000 capital subsidy |
| **Pradhan Mantri Mudra Yojana (PMMY)** | MSME Credit | Collateral-free business loan up to ₹10-20 Lakhs |

---

## 🏗 Sarvam AI Architecture Flow

```
[ Citizen Microphone ]
       │
       ▼ (Audio WebM/WAV)
[ /api/sarvam/transcribe ] ──► [ Sarvam Saaras STT ] ──► (Multilingual Transcript)
                                                                 │
                                                                 ▼
[ /api/sarvam/chat ] ◄────────────────────────────────────────────┘
       │
       ├─► [ Deterministic Rule Matcher ] (Evaluates profile against 12 schemes)
       │
       ├─► [ Sarvam-105B Reasoning Engine ]
       │        ├─ Understands situation & extracts profile fields
       │        ├─ Formulates progressive follow-up questions
       │        └─ Explains benefits in plain language
       │
       ▼
[ /api/sarvam/speak ] ──► [ Sarvam Bulbul TTS ] ──► (Base64 WAV Audio) ──► [ Browser Audio Player ]
```

### Document Verification Pipeline:
```
[ User Document (PDF/JPG/PNG) ]
       │
       ▼
[ /api/sarvam/vision ] ──► [ Sarvam Vision / Doc AI ]
                                    │
                                    ▼ (Extracted fields + Confidence)
                     [ Cross-Verification with Citizen Profile ]
                                    │
                       (Flags Mismatches & Missing Fields)
                                    │
                                    ▼
                     [ User Confirmation Modal ] ──► [ Update Live Profile ]
```

---

## 🔒 Security & Privacy

- **Server-Side API Key Protection**: The `SARVAM_API_KEY` is strictly used on server-side Next.js route handlers (`lib/sarvam/*`).
- **No Client Exposure**: Verified that `SARVAM_API_KEY` is never included in client JavaScript bundles or rendered in the DOM.
- **Git Protection**: `.env` is explicitly declared in `.gitignore` and `.env.example` is provided for safe onboarding.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v20 and v24)
- **npm** or **pnpm**
- A **Sarvam AI API Key** from [Sarvam Key Management](https://indus.sarvam.ai/key-management).

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Configure Your Sarvam API Key
Create your local `.env` file by copying `.env.example`:
```bash
cp .env.example .env
```
Open `.env` and add your API key:
```env
SARVAM_API_KEY=your_actual_sarvam_api_key_here
```

### 4. Verify API Connection
Test your Sarvam AI connection with the standalone verification script:
```bash
node test-sarvam-chat.mjs
```
You should see a live Hindi response from `sarvam-105b`.

### 5. Run the Automated E2E Test Suite
Run the 15-point end-to-end test suite covering scheme rules, Sarvam-105B reasoning, Bulbul speech generation, multilingual translations, and document extraction:
```bash
npx tsx test-e2e.ts
```

### 6. Start the Development Server
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000).

Or build and run the optimized production bundle:
```bash
npm run build
npm start
```

---

## 🧪 Testing Demo Mode (Walkthrough)

1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Click the **"Try Demo Mode"** button in the header.
3. The citizen profile is populated with **Ramesh Kumar** (Pune, Delivery Worker, ₹2,00,000 income, 2 children).
4. Notice how the scheme cards update to display **🟢 High Eligibility** for:
   - **PM Shram Yogi Maan-dhan (PM-SYM)**
   - **PM SVANidhi**
   - **Ayushman Bharat (PM-JAY)**
   - **Mukhyamantri Majhi Ladki Bahin Yojana**
5. Click **"Explain simply"** on any scheme card to see Sarvam-105B translate bureaucratic text into simple language.
6. Click **"Speak this"** to hear Sarvam Bulbul read the scheme out loud.
7. Click **"📄 Upload document"** and select the pre-loaded **"Tahsildar Income Certificate"** sample to test Sarvam Vision field extraction and cross-verification.
8. Click the microphone 🎙 and say:
   - *"Main Maharashtra mein delivery worker hoon, kya mujhe koi scheme mil sakti hai?"*
   - Or in Marathi: *"माझे वार्षिक उत्पन्न दोन लाख रुपये आहे, मला कोणत्या योजना मिळतील?"*
   - Watch the assistant transcribe, reason with Sarvam-105B, and speak back using Bulbul!

---

## 📁 Project Architecture

```
├── app/
│   ├── api/
│   │   ├── profile/route.ts         # Profile persistence & Demo citizen loader
│   │   ├── sarvam/
│   │   │   ├── chat/route.ts        # Sarvam-105B multi-turn conversational agent
│   │   │   ├── speak/route.ts       # Sarvam Bulbul TTS route
│   │   │   ├── transcribe/route.ts  # Sarvam Saaras STT route
│   │   │   └── vision/route.ts      # Sarvam Vision document extraction route
│   │   └── schemes/
│   │       └── match/route.ts       # Deterministic scheme matching route
│   ├── globals.css                  # Tailwind styles & voice wave animations
│   ├── layout.tsx                   # Typography and metadata
│   └── page.tsx                     # Main interactive application UI
│
├── components/
│   ├── AudioPlayerBar.tsx           # Global voice controls (pause, resume, stop)
│   ├── CitizenProfileCard.tsx       # Live editable profile & document drawer
│   ├── DocumentUploadModal.tsx      # Document upload & Sarvam Vision extraction
│   ├── Header.tsx                   # Tricolor logo, language selector & demo pill
│   ├── HeroSection.tsx              # Startup landing hero & trust disclaimers
│   ├── SchemeCards.tsx              # Filterable scheme cards & accordion guides
│   ├── SchemeExplanationModal.tsx   # Simple explanation modal with Bulbul audio
│   └── VoiceChat.tsx                # Voice-first chat, waveform & question chips
│
├── lib/
│   ├── db.ts                        # Local JSON/SQLite persistent store
│   ├── sarvam/
│   │   ├── llm.ts                   # Sarvam-105B integration & entity parsing
│   │   ├── stt.ts                   # Sarvam Saaras STT client
│   │   ├── tts.ts                   # Sarvam Bulbul TTS client
│   │   └── vision.ts                # Sarvam Vision Document Intelligence
│   └── schemes/
│       ├── data.ts                  # 12 authentic government schemes + Ramesh demo
│       ├── matcher.ts               # Deterministic qualification matcher
│       └── rules.ts                 # Rule evaluation engine
│
├── types/
│   └── index.ts                     # TypeScript schemas for profiles, schemes & chat
├── test-sarvam-chat.mjs             # Quick Sarvam-105B health check script
├── test-e2e.ts                      # 15-step automated E2E test suite
├── verify-http.mjs                  # HTTP route probe script
├── .env.example                     # Environment template
└── package.json
```

---

## ⚖️ Safety & Trust Disclaimer

> **Important**: *Sarkari Sahayak provides initial eligibility assessments based on user-provided details and publicly available government criteria. It does not issue official government approvals or guarantee fund disbursement. Citizens are always directed to verify final eligibility and submit formal applications through the official departmental portals or their nearest Common Service Centre (CSC).*

