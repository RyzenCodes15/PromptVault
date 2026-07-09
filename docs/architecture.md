# PromptVault Architecture

## System Overview

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[Landing Page]
        RQ[TanStack Query]
        API_CLIENT[API Client]
    end

    subgraph "Backend (FastAPI)"
        ROUTER[API Router]
        HEALTH[Health Endpoint]
        MIDDLEWARE[Middleware]
        EXCEPTIONS[Exception Handlers]
        SERVICES[Services Layer]
        REPOS[Repository Layer]
    end

    subgraph "Database"
        PG[(PostgreSQL)]
        ALEMBIC[Alembic Migrations]
    end

    subgraph "External Services (Future)"
        CLOUDINARY[Cloudinary]
        STRIPE[Stripe]
    end

    UI --> RQ --> API_CLIENT --> ROUTER
    ROUTER --> MIDDLEWARE --> HEALTH
    ROUTER --> MIDDLEWARE --> SERVICES
    SERVICES --> REPOS --> PG
    ALEMBIC --> PG
    SERVICES -.-> CLOUDINARY
    SERVICES -.-> STRIPE
```

## Backend Architecture

The backend follows a layered architecture:

| Layer | Responsibility |
|-------|---------------|
| **API** | Route definitions, request/response handling |
| **Services** | Business logic orchestration |
| **Repositories** | Data access and persistence |
| **Models** | SQLAlchemy ORM models |
| **Schemas** | Pydantic validation schemas |
| **Core** | Configuration, exceptions, response format |
| **Integrations** | Third-party service abstractions |
| **Middleware** | Cross-cutting concerns (logging, etc.) |

## Frontend Architecture

The frontend uses feature-based organization:

| Directory | Purpose |
|-----------|---------|
| **app/** | Next.js App Router pages and layouts |
| **components/ui/** | shadcn/ui primitives |
| **components/layout/** | Navbar, footer, page shells |
| **components/shared/** | Reusable cross-feature components |
| **features/** | Feature-specific components |
| **hooks/** | Custom React hooks |
| **services/** | API service functions |
| **lib/** | Utilities, clients, configuration |
| **types/** | TypeScript type definitions |
| **providers/** | React context providers |

## Data Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Next.js
    participant FastAPI
    participant PostgreSQL

    Browser->>Next.js: Load landing page
    Next.js->>Browser: Render SSR page
    Browser->>FastAPI: GET /api/health
    FastAPI->>PostgreSQL: SELECT 1
    PostgreSQL-->>FastAPI: OK
    FastAPI-->>Browser: {"status": "healthy"}
    Browser->>Browser: Show "Backend Online"
```
