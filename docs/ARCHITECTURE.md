# ManithPro Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Database Design](#database-design)
8. [Authentication & Security](#authentication--security)
9. [API Design](#api-design)
10. [Deployment Architecture](#deployment-architecture)
11. [Monitoring & Observability](#monitoring--observability)

---

## System Overview

ManithPro is a comprehensive HR Management and Recruitment Platform designed to streamline hiring processes for organizations of all sizes. The platform follows a modern microservices-inspired architecture with clear separation of concerns.

### Key Features

- **Job Management**: Create, publish, and manage job postings
- **Application Tracking**: Track candidates through the hiring pipeline
- **Interview Scheduling**: Schedule and manage interviews
- **User Management**: Role-based access control (Admin, Recruiter, Candidate)
- **Analytics**: Real-time recruitment metrics and reporting
- **Mobile Support**: Native iOS and Android applications

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
├────────────────┬────────────────┬────────────────┬─────────────────────┤
│   Web App      │   iOS App      │  Android App   │   Third-party       │
│   (React)      │   (RN/Swift)   │   (RN/Kotlin)  │   Integrations      │
└───────┬────────┴───────┬────────┴───────┬────────┴─────────┬───────────┘
        │                │                │                  │
        └────────────────┴────────────────┴──────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────────────┐
        │                    CDN (Cloudflare)                  │
        │         Static Assets | Edge Caching | WAF          │
        └─────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
        ┌─────────────────────────────────────────────────────┐
        │               Load Balancer (Nginx/K8s)             │
        │              SSL Termination | Routing              │
        └─────────────────────────┬───────────────────────────┘
                                  │
        ┌─────────────────────────┴───────────────────────────┐
        │                                                      │
        ▼                                                      ▼
┌───────────────────┐                              ┌───────────────────┐
│   API Gateway     │                              │   Static Server   │
│   (Express.js)    │                              │   (Nginx)         │
│                   │                              │                   │
│ • Rate Limiting   │                              │ • React SPA       │
│ • Auth Middleware │                              │ • Assets          │
│ • Request Logging │                              │ • Compression     │
└────────┬──────────┘                              └───────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│ Auth        │ Jobs        │ Users       │ Analytics        │
│ Service     │ Service     │ Service     │ Service          │
└──────┬──────┴──────┬──────┴──────┬──────┴────────┬─────────┘
       │             │             │               │
       └─────────────┴──────┬──────┴───────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                  ┌─────────────────┐
│   PostgreSQL    │                  │     Redis       │
│   (Primary DB)  │                  │   (Cache/Queue) │
│                 │                  │                 │
│ • User Data     │                  │ • Session Cache │
│ • Jobs          │                  │ • Rate Limits   │
│ • Applications  │                  │ • Job Queues    │
└─────────────────┘                  └─────────────────┘
```

---

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| TailwindCSS | Styling |
| React Query | Data Fetching |
| React Router | Navigation |
| Zustand | State Management |
| React Hook Form | Form Handling |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js 20 | Runtime |
| Express.js | Web Framework |
| TypeScript | Type Safety |
| Prisma | ORM |
| PostgreSQL | Primary Database |
| Redis | Caching/Sessions |
| JWT | Authentication |
| Zod | Validation |

### Mobile

| Technology | Purpose |
|------------|---------|
| React Native | Cross-platform |
| Expo | Development Framework |
| TypeScript | Type Safety |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Kubernetes | Orchestration |
| Cloudflare | CDN/WAF |
| GitHub Actions | CI/CD |
| Sentry | Error Tracking |
| Prometheus | Metrics |

---

## Project Structure

```
KreupAI.ManithPro/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── models/             # Data models
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── database/           # Database utilities
│   │   ├── monitoring/         # Health checks & metrics
│   │   ├── docs/               # API documentation
│   │   └── utils/              # Shared utilities
│   ├── prisma/                 # Database schema & migrations
│   └── tests/                  # Backend tests
│
├── frontend/                   # React web application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API clients
│   │   ├── store/              # State management
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utilities
│   └── tests/                  # Frontend tests
│
├── mobile/                     # Mobile applications
│   ├── ios/                    # iOS specific code
│   ├── android/                # Android specific code
│   └── src/                    # Shared RN code
│
├── infrastructure/             # Infrastructure configs
│   ├── docker/                 # Docker configurations
│   ├── kubernetes/             # K8s manifests
│   ├── cdn/                    # CDN configuration
│   └── terraform/              # IaC definitions
│
├── scripts/                    # Utility scripts
├── docs/                       # Documentation
└── .github/                    # GitHub Actions workflows
```

---

## Backend Architecture

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│                  (Controllers & Routes)                      │
├─────────────────────────────────────────────────────────────┤
│                      Business Layer                          │
│                      (Services)                              │
├─────────────────────────────────────────────────────────────┤
│                       Data Layer                             │
│                (Repositories & Models)                       │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│            (Database, Cache, External APIs)                  │
└─────────────────────────────────────────────────────────────┘
```

### Middleware Pipeline

```typescript
// Request flow through middleware
app.use(requestId);           // Assign unique request ID
app.use(securityHeaders);     // Helmet security headers
app.use(cors);                // CORS handling
app.use(compression);         // Response compression
app.use(rateLimiter);         // Rate limiting
app.use(logging);             // Request logging
app.use(authentication);      // JWT validation
app.use(routes);              // Route handlers
app.use(errorHandler);        // Error handling
app.use(sentryErrorHandler);  // Error reporting
```

### Service Pattern

```typescript
// Example service structure
class JobService {
  constructor(
    private prisma: PrismaClient,
    private cache: CacheService,
    private eventBus: EventBus
  ) {}

  async createJob(data: CreateJobDto): Promise<Job> {
    // 1. Validate input
    const validated = jobSchema.parse(data);

    // 2. Business logic
    const job = await this.prisma.job.create({ data: validated });

    // 3. Emit event
    this.eventBus.emit('job.created', job);

    // 4. Invalidate cache
    await this.cache.invalidate(`jobs:*`);

    return job;
  }
}
```

---

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── common/              # Shared components
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   ├── features/            # Feature-specific components
│   │   ├── jobs/
│   │   ├── applications/
│   │   └── interviews/
│   └── layouts/             # Layout components
│       ├── DashboardLayout/
│       └── AuthLayout/
```

### State Management

```typescript
// Zustand store example
interface AuthStore {
  user: User | null;
  token: string | null;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  login: async (credentials) => {
    const response = await authApi.login(credentials);
    set({ user: response.user, token: response.token });
  },
  logout: () => set({ user: null, token: null }),
}));
```

### Data Fetching

```typescript
// React Query example
function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobsApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## Database Design

### Entity Relationship Overview

```
┌───────────┐       ┌───────────┐       ┌───────────┐
│   User    │───────│Application│───────│    Job    │
└───────────┘       └───────────┘       └───────────┘
      │                   │                   │
      │                   │                   │
      ▼                   ▼                   ▼
┌───────────┐       ┌───────────┐       ┌───────────┐
│  Profile  │       │ Interview │       │Department │
└───────────┘       └───────────┘       └───────────┘
```

### Key Tables

| Table | Description |
|-------|-------------|
| User | User accounts and authentication |
| Profile | Extended user profile information |
| Organization | Companies using the platform |
| Job | Job postings |
| Application | Job applications from candidates |
| Interview | Scheduled interviews |
| Assessment | Candidate assessments |

### Indexing Strategy

- Primary keys: UUID with auto-generation
- Foreign keys: Indexed for join performance
- Search fields: Full-text search indexes
- Timestamp fields: Indexed for sorting/filtering
- Composite indexes: For common query patterns

---

## Authentication & Security

### Authentication Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Client  │───▶│  Login  │───▶│ Verify  │───▶│  Issue  │
│         │    │ Request │    │  Creds  │    │   JWT   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                                                  │
                                                  ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Access  │◀───│ Validate│◀───│   API   │◀───│  Store  │
│ Resource│    │   JWT   │    │ Request │    │  Token  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### Security Measures

1. **Transport Security**: TLS 1.2+ enforced
2. **Authentication**: JWT with refresh tokens
3. **Authorization**: Role-based access control (RBAC)
4. **Rate Limiting**: Per-endpoint rate limits
5. **Input Validation**: Zod schemas for all inputs
6. **SQL Injection**: Parameterized queries via Prisma
7. **XSS Protection**: Content Security Policy headers
8. **CSRF Protection**: SameSite cookies + tokens

---

## API Design

### RESTful Conventions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/jobs | List jobs |
| POST | /api/jobs | Create job |
| GET | /api/jobs/:id | Get job details |
| PATCH | /api/jobs/:id | Update job |
| DELETE | /api/jobs/:id | Delete job |

### Response Format

```json
{
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Format

```json
{
  "error": "ValidationError",
  "message": "Invalid input data",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ],
  "requestId": "req_abc123"
}
```

---

## Deployment Architecture

### Container Strategy

```yaml
# docker-compose.yml structure
services:
  api:
    build: ./backend
    replicas: 3
    resources:
      limits:
        memory: 512M
        cpus: '0.5'

  web:
    build: ./frontend
    replicas: 2

  postgres:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb
```

### Kubernetes Deployment

- **Deployment**: Rolling updates with zero downtime
- **Service**: Internal load balancing
- **Ingress**: External traffic routing
- **HPA**: Horizontal Pod Autoscaler for scaling
- **PDB**: Pod Disruption Budget for availability

---

## Monitoring & Observability

### Metrics Collection

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Application │───▶│ Prometheus  │───▶│   Grafana   │
│   Metrics   │    │   Scraper   │    │  Dashboard  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Key Metrics

- **HTTP**: Request rate, latency, error rate
- **Database**: Query time, connection pool
- **Cache**: Hit rate, memory usage
- **Business**: Active users, job applications

### Alerting Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| High Error Rate | > 5% 5xx errors | Critical |
| Slow Response | P99 > 2s | Warning |
| Database Down | Health check fails | Critical |
| High Memory | > 90% usage | Warning |

### Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/health` | Comprehensive health status |
| `/live` | Kubernetes liveness probe |
| `/ready` | Kubernetes readiness probe |
| `/metrics` | Prometheus metrics |

---

## Additional Resources

- [API Documentation](/api/docs) - Swagger/OpenAPI docs
- [Database Schema](/prisma/schema.prisma) - Prisma schema
- [Contributing Guide](/CONTRIBUTING.md) - How to contribute
- [Deployment Guide](/docs/DEPLOYMENT.md) - Deployment instructions
