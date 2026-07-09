# PromptVault

> The AI Prompt Marketplace — Buy, sell, and discover expertly crafted prompts for AI image generation.

PromptVault is a production-grade SaaS platform where creators monetize their prompt engineering skills. Built with a modern full-stack architecture, it's designed for scalability, maintainability, and developer experience.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query, Framer Motion, React Hook Form, Zod |
| **Backend** | FastAPI, Python 3.12+, SQLAlchemy 2 (async), Alembic, Pydantic v2 |
| **Database** | PostgreSQL 16 |
| **DevOps** | Docker, Docker Compose, GitHub Actions |
| **Deployment** | Vercel (frontend), Render (backend), Neon (PostgreSQL) |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend      │────▶│    Backend       │────▶│   PostgreSQL    │
│   Next.js 15     │     │   FastAPI        │     │                 │
│   Port 3000      │     │   Port 8000      │     │   Port 5432     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

The backend follows a layered architecture: **API → Services → Repositories → Models**, with centralized configuration, exception handling, and response formatting.

The frontend uses feature-based organization with shared components, custom hooks, and service layers for API communication.

See [docs/architecture.md](docs/architecture.md) for detailed diagrams.

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 22+ (for local frontend dev)
- Python 3.12+ (for local backend dev)

### Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/PromptVault.git
cd PromptVault

# Copy environment variables
cp .env.example .env

# Start all services
docker compose up --build
```

Open:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/health
- **API Docs**: http://localhost:8000/docs

### Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

---

## Development Workflow

1. **Backend changes**: Edit files in `backend/app/`, the server auto-reloads with `--reload`.
2. **Frontend changes**: Edit files in `frontend/src/`, Next.js hot-reloads automatically.
3. **Database migrations**: Use `alembic revision --autogenerate -m "description"` then `alembic upgrade head`.
4. **Linting**: Run `ruff check .` (backend) and `npm run lint` (frontend).
5. **Testing**: Run `pytest tests/ -v` (backend).

---

## Folder Structure

```
PromptVault/
├── backend/
│   ├── app/
│   │   ├── api/              # Route definitions
│   │   ├── core/             # Config, exceptions, response format
│   │   ├── db/               # Engine, session, base model
│   │   ├── integrations/     # Third-party service abstractions
│   │   ├── middleware/       # Request logging, etc.
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── repositories/     # Data access layer
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic
│   │   └── utils/            # Shared utilities
│   ├── alembic/              # Database migrations
│   ├── tests/                # Backend tests
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages and layouts
│   │   ├── components/       # UI and layout components
│   │   ├── features/         # Feature-specific components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and clients
│   │   ├── providers/        # React context providers
│   │   ├── services/         # API service functions
│   │   └── types/            # TypeScript type definitions
│   ├── next.config.ts
│   └── package.json
├── docker/
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── docs/
│   └── architecture.md
├── .github/workflows/
│   └── ci.yml
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT tokens (future) |
| `CLOUDINARY_*` | Cloudinary credentials (future) |
| `STRIPE_*` | Stripe API keys (future) |
| `NEXT_PUBLIC_API_URL` | Backend URL for frontend API calls |

---

## License

MIT
