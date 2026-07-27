# PayNest

A full-stack personal finance management platform built with microservices. Track accounts, log transactions, set budgets, and get AI-powered financial advice — all from one dashboard.

## Tech Stack

**Backend**
- Java 21 / Spring Boot 3 — User Service, Finance Service, API Gateway
- Python 3.11 / FastAPI — AI Service (Gemini / OpenAI integration)
- PostgreSQL 16 — shared database with isolated schemas
- Spring Cloud Gateway — JWT validation, routing, header propagation

**Frontend**
- React 18 + TypeScript + Vite
- TanStack React Query for server state
- Recharts for data visualization
- Lucide React icons
- Custom dark glassmorphism design system (vanilla CSS)

## Architecture

```
┌─────────────┐     ┌──────────────────────────────────────────────┐
│  React SPA  │────▶│  API Gateway (:8080)                        │
│  (:5173)    │     │  JWT validation + route forwarding           │
└─────────────┘     └──────┬──────────────┬──────────────┬─────────┘
                           │              │              │
                    ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐
                    │ User Service│ │  Finance   │ │ AI Service│
                    │   (:8081)   │ │  Service   │ │  (:8090)  │
                    │             │ │  (:8082)   │ │  FastAPI  │
                    └──────┬──────┘ └─────┬──────┘ └───────────┘
                           │              │
                    ┌──────▼──────────────▼──────┐
                    │     PostgreSQL (:5432)      │
                    │  user_schema │ finance_schema│
                    └────────────────────────────┘
```

## Features

- **Authentication** — JWT-based login/register with token refresh
- **Accounts** — CRUD for bank, cash, credit card, savings, investment accounts
- **Transactions** — Log income, expenses, and inter-account transfers
- **Categories** — System defaults + custom categories with icons and colors
- **Budgets** — Set spending limits per category with real-time progress tracking
- **Dashboard** — Net worth, monthly cashflow stats, expense breakdown chart, recent activity
- **AI Advisor** — Chat with a financial copilot, get health insights, scenario analysis (e.g. "Can I afford a 45K phone on 12-month installment at 2.5% interest?")
- **Auto-Categorization** — AI suggests categories when logging transactions

## Getting Started

### Prerequisites

- Docker & Docker Compose
- (Optional) Node.js 20+ if running the frontend outside Docker
- (Optional) Gemini or OpenAI API key for AI features

### Run with Docker

```bash
# Clone the repo
git clone https://github.com/KavithRashinwortha/PayNest.git
cd PayNest

# (Optional) Set AI API key
export GEMINI_API_KEY=your_key_here

# Start everything
docker-compose up --build
```

That's it. All 6 containers (Postgres, User Service, Finance Service, AI Service, Gateway, Web App) will spin up.

### Access

| Service | URL |
|---------|-----|
| Web App | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

### Run Frontend Separately (Dev Mode)

```bash
cd paynest-web
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `localhost:8080`.

## Project Structure

```
PayNest/
├── user-service/        # Auth, JWT, user profiles (Spring Boot)
├── finance-service/     # Accounts, transactions, budgets, analytics (Spring Boot)
├── ai-service/          # Chat, insights, categorization (FastAPI + LangChain)
├── gateway/             # API Gateway (Spring Cloud Gateway)
├── paynest-web/         # React frontend
├── docker/              # DB init scripts
└── docker-compose.yml
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | No (falls back to rules engine) |
| `OPENAI_API_KEY` | OpenAI API key (alternative to Gemini) | No |

## Default Currency

LKR (Sri Lankan Rupee). Users can change their preferred currency in profile settings.

## License

MIT