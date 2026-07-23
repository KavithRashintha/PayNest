# PayNest AI Agent Service (FastAPI)

The **AI Agent Service** is a FastAPI microservice responsible for natural language financial insights, automated transaction categorization recommendations, budget advice, and chat assistance for PayNest users.

## Setup & Running Locally

### 1. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Development Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8090 --reload
```
The health check endpoint will be available at `http://localhost:8090/api/ai/health` (and via API Gateway at `http://localhost:8080/api/ai/health`).
