# ManithPro Developer Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Code Style & Conventions](#code-style--conventions)
4. [Backend Development](#backend-development)
5. [Frontend Development](#frontend-development)
6. [Database Operations](#database-operations)
7. [Testing](#testing)
8. [Debugging](#debugging)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 20.x
- **pnpm** >= 8.x (recommended) or npm
- **PostgreSQL** >= 15.x
- **Redis** >= 7.x
- **Docker** (optional, for containerized development)
- **Git**

### Quick Start

```bash
# Clone the repository
git clone https://github.com/KreupAI-Technologies/KreupAI.ManithPro.git
cd KreupAI.ManithPro

# Install dependencies
pnpm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start PostgreSQL and Redis (using Docker)
docker-compose up -d postgres redis

# Run database migrations
cd backend && pnpm prisma migrate dev

# Seed the database (optional)
pnpm db:seed

# Start development servers
pnpm dev
```

### Environment Configuration

Create your `.env` files based on the examples:

**Backend (.env)**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/manithpro

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Optional: Sentry
SENTRY_DSN=

# Optional: Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=ManithPro
```

---

## Development Environment

### Directory Structure Overview

```
.
├── backend/          # Express.js API server
├── frontend/         # React web application
├── mobile/           # React Native mobile app
├── infrastructure/   # Docker, K8s, CDN configs
├── scripts/          # Utility scripts
├── docs/             # Documentation
└── shared/           # Shared types/utilities
```

### IDE Setup

#### VS Code (Recommended)

Install recommended extensions:
- ESLint
- Prettier
- Prisma
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense
- GitLens

Settings are configured via `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### Running Services

```bash
# Start all services
pnpm dev

# Start backend only
pnpm --filter backend dev

# Start frontend only
pnpm --filter frontend dev

# Start with Docker
docker-compose up
```

---

## Code Style & Conventions

### TypeScript Guidelines

```typescript
// Use explicit types for function parameters and returns
function calculateScore(application: Application): number {
  // ...
}

// Use interfaces for object shapes
interface JobFilters {
  department?: string;
  location?: string;
  status?: JobStatus;
}

// Use enums for fixed values
enum JobStatus {
  Draft = 'draft',
  Published = 'published',
  Closed = 'closed',
}

// Prefer const assertions for literal types
const ROLES = ['admin', 'recruiter', 'candidate'] as const;
type Role = typeof ROLES[number];
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `job-service.ts` |
| Classes | PascalCase | `JobService` |
| Functions | camelCase | `createJob()` |
| Constants | SCREAMING_SNAKE | `MAX_FILE_SIZE` |
| Interfaces | PascalCase | `JobFilters` |
| Types | PascalCase | `JobStatus` |
| Components | PascalCase | `JobCard.tsx` |

### File Organization

```typescript
// 1. External imports
import express from 'express';
import { z } from 'zod';

// 2. Internal imports (absolute paths)
import { prisma } from '@/database';
import { logger } from '@/utils/logger';

// 3. Types
interface ServiceOptions {
  // ...
}

// 4. Constants
const DEFAULT_LIMIT = 20;

// 5. Main code
export class MyService {
  // ...
}

// 6. Helper functions (if any)
function helperFunction() {
  // ...
}
```

---

## Backend Development

### Creating a New API Endpoint

1. **Define the Route** (`src/routes/jobs.ts`):

```typescript
import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createJobSchema } from '../schemas/job.schema';

const router = Router();
const controller = new JobController();

router.get('/', controller.list);
router.post('/', authenticate, validate(createJobSchema), controller.create);
router.get('/:id', controller.getById);
router.patch('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);

export default router;
```

2. **Create the Controller** (`src/controllers/job.controller.ts`):

```typescript
import { Request, Response, NextFunction } from 'express';
import { JobService } from '../services/job.service';

export class JobController {
  private service = new JobService();

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, ...filters } = req.query;
      const result = await this.service.list({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        filters,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await this.service.create(req.body, req.user!.id);
      res.status(201).json(job);
    } catch (error) {
      next(error);
    }
  };
}
```

3. **Implement the Service** (`src/services/job.service.ts`):

```typescript
import { prisma } from '../database';
import { Prisma } from '@prisma/client';

export class JobService {
  async list(options: ListOptions) {
    const { page, limit, filters } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      status: filters.status || 'published',
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.job.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: CreateJobDto, userId: string) {
    return prisma.job.create({
      data: {
        ...data,
        createdBy: userId,
      },
    });
  }
}
```

4. **Add Validation Schema** (`src/schemas/job.schema.ts`):

```typescript
import { z } from 'zod';

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(50).max(10000),
    department: z.string(),
    location: z.string(),
    type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
    salary: z.object({
      min: z.number().positive().optional(),
      max: z.number().positive().optional(),
      currency: z.string().default('USD'),
    }).optional(),
  }),
});
```

### Error Handling

Use the custom error classes:

```typescript
import { AppError, NotFoundError, ValidationError } from '../utils/errors';

// In your service
async getById(id: string) {
  const job = await prisma.job.findUnique({ where: { id } });

  if (!job) {
    throw new NotFoundError('Job not found');
  }

  return job;
}
```

---

## Frontend Development

### Creating a New Page

1. **Create the Page Component** (`src/pages/jobs/JobListPage.tsx`):

```tsx
import { useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { JobCard } from '@/components/features/jobs/JobCard';
import { Pagination } from '@/components/common/Pagination';
import { JobFilters } from '@/components/features/jobs/JobFilters';

export function JobListPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const { data, isLoading, error } = useJobs({ page, ...filters });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Jobs</h1>

      <JobFilters
        value={filters}
        onChange={setFilters}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.data.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={data?.pagination.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}
```

2. **Create the Custom Hook** (`src/hooks/useJobs.ts`):

```typescript
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '@/services/api';

export function useJobs(params: JobsParams) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobsApi.list(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
```

3. **Add the Route** (`src/routes.tsx`):

```tsx
import { JobListPage } from '@/pages/jobs/JobListPage';

export const routes = [
  {
    path: '/jobs',
    element: <JobListPage />,
  },
  // ...
];
```

### Component Guidelines

```tsx
// Good component structure
interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  className?: string;
}

export function JobCard({ job, onApply, className }: JobCardProps) {
  // 1. Hooks first
  const navigate = useNavigate();
  const { user } = useAuth();

  // 2. Derived state
  const canApply = user?.role === 'candidate' && job.status === 'published';

  // 3. Event handlers
  const handleApply = () => {
    onApply?.(job.id);
  };

  // 4. Render
  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <h3 className="font-semibold">{job.title}</h3>
      <p className="text-gray-600">{job.department}</p>
      {canApply && (
        <button onClick={handleApply}>Apply</button>
      )}
    </div>
  );
}
```

---

## Database Operations

### Running Migrations

```bash
# Create a new migration
pnpm prisma migrate dev --name add_user_preferences

# Apply migrations (production)
pnpm prisma migrate deploy

# Reset database (development only!)
pnpm prisma migrate reset
```

### Seeding Data

```bash
# Run seeds
pnpm db:seed

# Custom seed
pnpm prisma db seed -- --environment test
```

### Schema Changes

1. Edit `prisma/schema.prisma`
2. Generate client: `pnpm prisma generate`
3. Create migration: `pnpm prisma migrate dev`

```prisma
// Example: Adding a new field
model Job {
  id          String   @id @default(uuid())
  title       String
  description String
  remote      Boolean  @default(false)  // New field
  // ...
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run backend tests
pnpm --filter backend test

# Run frontend tests
pnpm --filter frontend test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test -- job.service.test.ts

# Watch mode
pnpm test:watch
```

### Writing Tests

**Backend Unit Test:**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JobService } from './job.service';
import { prismaMock } from '../test/mocks/prisma';

describe('JobService', () => {
  let service: JobService;

  beforeEach(() => {
    service = new JobService();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a job', async () => {
      const jobData = {
        title: 'Software Engineer',
        description: 'Build great software',
        department: 'Engineering',
        location: 'Remote',
        type: 'full-time',
      };

      prismaMock.job.create.mockResolvedValue({
        id: '1',
        ...jobData,
        createdAt: new Date(),
      });

      const result = await service.create(jobData, 'user-1');

      expect(result.title).toBe(jobData.title);
      expect(prismaMock.job.create).toHaveBeenCalledTimes(1);
    });
  });
});
```

**Frontend Component Test:**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { JobCard } from './JobCard';

describe('JobCard', () => {
  const mockJob = {
    id: '1',
    title: 'Software Engineer',
    department: 'Engineering',
    status: 'published',
  };

  it('renders job title', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('calls onApply when apply button clicked', () => {
    const onApply = vi.fn();
    render(<JobCard job={mockJob} onApply={onApply} />);

    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(onApply).toHaveBeenCalledWith('1');
  });
});
```

---

## Debugging

### Backend Debugging

```bash
# Start with debugger
node --inspect-brk dist/server.js

# Or with ts-node
node --inspect-brk -r ts-node/register src/server.ts
```

VS Code launch config (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["--filter", "backend", "dev:debug"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Logging

```typescript
import { logger } from '@/utils/logger';

// Different log levels
logger.debug('Detailed debug info', { data });
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred', error);
```

---

## Common Tasks

### Adding a New API Integration

```typescript
// src/integrations/slack.ts
import axios from 'axios';

export class SlackIntegration {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendNotification(message: string) {
    await axios.post(this.webhookUrl, { text: message });
  }
}
```

### Adding a New Environment Variable

1. Add to `.env.example`
2. Update validation in `src/config/env.ts`
3. Document in this guide

```typescript
// src/config/env.ts
export const env = {
  MY_NEW_VAR: process.env.MY_NEW_VAR || 'default',
};
```

### Creating a Database Backup

```bash
# Using the backup script
./scripts/db-backup.sh

# Manual backup
pg_dump -U postgres manithpro > backup.sql
```

---

## Troubleshooting

### Common Issues

**"Cannot connect to database"**
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart the database
docker-compose restart postgres
```

**"Prisma client not generated"**
```bash
pnpm prisma generate
```

**"Port already in use"**
```bash
# Find process using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>
```

**"Node modules issues"**
```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Getting Help

- Check existing [GitHub Issues](https://github.com/KreupAI-Technologies/KreupAI.ManithPro/issues)
- Review the [Architecture Documentation](./ARCHITECTURE.md)
- Ask in the team Slack channel

---

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
