# LiFE Companion: Mission LiFE Citizen Engagement App

> HackCult '26 · Track 1: Green Energy & Sustainability · Problem ID: HC26-GEDA01
> Organisation: Gujarat Energy Development Agency (GEDA)

A mobile-first sustainability companion that helps citizens measure their carbon footprint, receive contextual energy-saving nudges, earn points for green actions, and check rooftop-solar feasibility.

**Author:** Mayank Krishna (Mayank Swaraj) · [GitHub](https://github.com/mayankswaraj18cr-cmd)

---

## 1. Problem

Awareness of climate change is high, but citizens lack personalised tools to measure their footprint, get real-time reduction advice, and see the impact of their actions. This project bridges macro climate goals and micro daily habits, in line with the Mission LiFE philosophy.

## 2. Features

| GEDA requirement | Implementation |
|---|---|
| Personalised Footprint Tracker | Onboarding form (electricity, LPG, petrol, diet) → monthly kg CO₂e, biggest-source insight, trend chart |
| Behavioural Nudges & Micro-Tasks | Time-of-day nudges (evening peak 6–10 pm, midday solar, off-peak) + 5 daily micro-tasks with CO₂ savings |
| Gamification & Social Impact | 10 points per task, community goal bar, leaderboard |
| Actionable Resource Hub | Rooftop-solar calculator (capacity, cost, subsidy, payback, CO₂ avoided) + GEDA vendor pointer |

## 3. Demo

- Live/hosted: `<add GitHub Pages / Vercel link>`
- Video walkthrough: `<add unlisted YouTube/Loom link>`
- Pitch deck: `<add PDF link>`

**Run locally:** open `index.html` in any browser. No build step and no dependencies.

## 4. Architecture

```
┌────────────────────────────────────────────┐
│ Client: index.html (HTML/CSS/vanilla JS)   │
│ ┌───────────┐ ┌──────────┐ ┌─────────────┐ │
│ │ Footprint │ │  Nudge   │ │ Gamification│ │
│ │  Engine   │ │  Engine  │ │ + Leaderboard│ │
│ └───────────┘ └──────────┘ └─────────────┘ │
│ ┌──────────────────┐  ┌──────────────────┐ │
│ │ Solar Calculator │  │ localStorage     │ │
│ └──────────────────┘  └──────────────────┘ │
└──────────────────┬─────────────────────────┘
                   │ REST/JSON (optional)
┌──────────────────▼─────────────────────────┐
│ Backend: FastAPI (backend/main.py)         │
│ /footprint  /points/{user}/{n}  /leaderboard│
└──────────────────┬─────────────────────────┘
                   │
┌──────────────────▼─────────────────────────┐
│ Database: PostgreSQL / Firestore (planned) │
└────────────────────────────────────────────┘
```

**Design decisions**
- **Offline-first client:** all calculations run in the browser, so the app works in low-connectivity areas.
- **Zero dependencies:** a single file is easy to deploy, audit and load on low-end phones.
- **Optional backend:** enables multi-user leaderboards and state-level analytics when deployed.

*(Replace or supplement the diagram above with an image at `docs/architecture.png`.)*

## 5. Calculation models

**Footprint (monthly):**
`CO₂e = kWh × 0.82 + LPG cylinders × (14.2 × 2.98) + petrol L × 2.31 + meat meals/week × (2.5 × 4.33)`

**Solar:**
- Capacity = min(roof area ÷ 10 m² per kW, annual demand ÷ 1500 kWh/kW/yr), with a 1 kW minimum
- Generation = capacity × 1500 kWh/yr
- Cost = capacity × ₹55,000
- Subsidy = ₹30,000/kW up to 2 kW + ₹18,000 for the 3rd kW
- Payback = (cost − subsidy) ÷ annual savings

**Assumptions** (all approximate; verify against current CEA / MNRE / PM Surya Ghar figures before any official use): grid emission factor 0.82 kg/kWh, LPG 2.98 kg CO₂/kg, petrol 2.31 kg CO₂/L, meat ≈ 2.5 kg CO₂ per meal, solar yield 1500 kWh/kW/yr, ₹55k per kW installed.

## 6. API (optional backend)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/footprint` | Body: `user, kwh, lpg, petrol, meat` → monthly kg CO₂e |
| POST | `/points/{user}/{n}` | Add `n` points to a user |
| GET | `/leaderboard` | Top 10 users |

Run:
```bash
cd backend
pip install fastapi uvicorn
uvicorn main:app --reload
# docs at http://127.0.0.1:8000/docs
```

## 7. Database schema (production design)

```
users(id PK, name, city, created_at)
footprints(id PK, user_id FK, month, kwh, lpg, petrol, meat, kg_co2e)
tasks(id PK, title, kg_co2e_saved, points)
task_completions(id PK, user_id FK, task_id FK, completed_on, UNIQUE(user_id, task_id, completed_on))
communities(id PK, name, city, goal_kg)
community_members(user_id FK, community_id FK)
```
Indexes: `task_completions(user_id, completed_on)`, `footprints(user_id, month)`. The leaderboard is a materialised aggregate over `task_completions`.

## 8. Tech stack

- **Frontend:** HTML5, CSS variables (light/dark), vanilla JavaScript, Canvas chart
- **Backend:** Python, FastAPI, Pydantic
- **Storage:** browser localStorage (prototype) → PostgreSQL or Cloud Firestore (production)
- **Planned integrations:** OpenWeather (solar irradiance), Google Maps (vendor finder)

## 9. Scalability

- Stateless API behind a load balancer for horizontal scaling
- Client-side computation keeps server load minimal
- Cached aggregates for leaderboards and community goals
- Planned: JWT auth, rate limiting, CDN for static assets, read replicas

## 10. Testing

Manual test checklist (all pass in the prototype):
- Footprint calculates and persists after refresh
- Trend chart updates on each save
- Nudge text changes across peak, midday and off-peak hours
- A task can be completed once per day and awards points once
- Solar estimate returns capacity, cost, subsidy and payback
- Layout works at ~360 px width and in dark mode

Planned: pytest for the API, unit tests for the calculation functions.

## 11. Limitations

- The leaderboard is simulated locally; other users are placeholders
- No authentication; backend storage is in-memory
- Emission and cost factors are approximate and unvalidated
- Nudges are rule-based, with no live grid-peak data
- Task completion is self-reported and unverified
- No user study, so impact claims are hypotheses

## 12. Roadmap

1. Authentication and Firestore/PostgreSQL sync
2. Live solar irradiance via OpenWeather
3. Maps-based GEDA-empanelled vendor directory
4. Gujarati and Hindi interface
5. Smart-meter / bill-photo OCR for automatic readings
6. Verified community challenges and anti-cheat
7. Pilot study with measured consumption

## 13. Repository structure

```
life-companion-mission-life/
├── index.html
├── backend/
│   └── main.py
├── docs/
│   └── architecture.png
├── LiFE_Companion_Research_Paper.pdf
└── README.md
```

## 14. License

MIT
