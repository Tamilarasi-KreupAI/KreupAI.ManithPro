import { Router, Request, Response } from 'express';

import { checkDatabaseHealth } from '../database/prisma';
import { checkCacheHealth } from '../database/cache';

// ============================================================
// HEALTH CHECK ENDPOINTS
// ============================================================
//
// This module provides health check endpoints for:
// - Kubernetes liveness probes
// - Kubernetes readiness probes
// - Load balancer health checks
// - Monitoring systems
// ============================================================

const router = Router();

// ============================================================
// TYPES
// ============================================================

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      latency: number;
      error?: string;
    };
    cache: {
      status: 'up' | 'down';
      latency: number;
      error?: string;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      heapUsed: number;
      heapTotal: number;
      rss: number;
      percentUsed: number;
    };
  };
}

interface ReadinessStatus {
  ready: boolean;
  timestamp: string;
  checks: Record<string, boolean>;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getMemoryStatus(): HealthStatus['checks']['memory'] {
  const memory = process.memoryUsage();
  const heapUsed = Math.round(memory.heapUsed / 1024 / 1024);
  const heapTotal = Math.round(memory.heapTotal / 1024 / 1024);
  const rss = Math.round(memory.rss / 1024 / 1024);
  const percentUsed = Math.round((heapUsed / heapTotal) * 100);

  let status: 'ok' | 'warning' | 'critical' = 'ok';
  if (percentUsed > 90) {
    status = 'critical';
  } else if (percentUsed > 75) {
    status = 'warning';
  }

  return {
    status,
    heapUsed,
    heapTotal,
    rss,
    percentUsed,
  };
}

// ============================================================
// HEALTH ENDPOINT
// ============================================================

/**
 * GET /health
 *
 * Comprehensive health check endpoint.
 * Returns detailed status of all services.
 *
 * Used for:
 * - Monitoring dashboards
 * - Detailed health status
 */
router.get('/health', async (_req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Check all services in parallel
    const [dbHealth, cacheHealth] = await Promise.all([
      checkDatabaseHealth().catch((err) => ({
        healthy: false,
        latency: 0,
        error: err.message,
      })),
      checkCacheHealth().catch((err) => ({
        healthy: false,
        latency: 0,
        error: err.message,
      })),
    ]);

    const memoryStatus = getMemoryStatus();

    // Determine overall status
    let status: HealthStatus['status'] = 'healthy';
    if (!dbHealth.healthy || !cacheHealth.healthy) {
      status = 'unhealthy';
    } else if (memoryStatus.status !== 'ok') {
      status = 'degraded';
    }

    const health: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      uptime: Math.round(process.uptime()),
      checks: {
        database: {
          status: dbHealth.healthy ? 'up' : 'down',
          latency: dbHealth.latency,
          error: dbHealth.error,
        },
        cache: {
          status: cacheHealth.healthy ? 'up' : 'down',
          latency: cacheHealth.latency,
          error: cacheHealth.error,
        },
        memory: memoryStatus,
      },
    };

    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

    res.status(httpStatus).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      duration: Date.now() - startTime,
    });
  }
});

// ============================================================
// LIVENESS ENDPOINT
// ============================================================

/**
 * GET /live
 *
 * Simple liveness check.
 * Returns 200 if the process is running.
 *
 * Used for:
 * - Kubernetes liveness probes
 * - Basic "is it running" checks
 */
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// READINESS ENDPOINT
// ============================================================

/**
 * GET /ready
 *
 * Readiness check for accepting traffic.
 * Verifies all dependencies are accessible.
 *
 * Used for:
 * - Kubernetes readiness probes
 * - Load balancer health checks
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check critical dependencies
    const [dbHealth, cacheHealth] = await Promise.all([
      checkDatabaseHealth().catch(() => ({ healthy: false })),
      checkCacheHealth().catch(() => ({ healthy: false })),
    ]);

    const checks = {
      database: dbHealth.healthy,
      cache: cacheHealth.healthy,
    };

    // Ready if database is available (cache can be optional)
    const ready = checks.database;

    const response: ReadinessStatus = {
      ready,
      timestamp: new Date().toISOString(),
      checks,
    };

    res.status(ready ? 200 : 503).json(response);
  } catch (error) {
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Readiness check failed',
    });
  }
});

// ============================================================
// METRICS ENDPOINT
// ============================================================

/**
 * GET /metrics
 *
 * Prometheus-compatible metrics endpoint.
 * Returns metrics in Prometheus text format.
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  const memory = process.memoryUsage();
  const uptime = process.uptime();

  // Check service health
  const [dbHealth, cacheHealth] = await Promise.all([
    checkDatabaseHealth().catch(() => ({ healthy: false, latency: 0 })),
    checkCacheHealth().catch(() => ({ healthy: false, latency: 0 })),
  ]);

  // Format as Prometheus metrics
  const metrics = `
# HELP nodejs_heap_size_total_bytes Total heap size in bytes
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes ${memory.heapTotal}

# HELP nodejs_heap_size_used_bytes Used heap size in bytes
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes ${memory.heapUsed}

# HELP nodejs_external_memory_bytes External memory in bytes
# TYPE nodejs_external_memory_bytes gauge
nodejs_external_memory_bytes ${memory.external}

# HELP nodejs_rss_bytes Resident Set Size in bytes
# TYPE nodejs_rss_bytes gauge
nodejs_rss_bytes ${memory.rss}

# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${uptime}

# HELP database_health Database health status (1 = healthy, 0 = unhealthy)
# TYPE database_health gauge
database_health ${dbHealth.healthy ? 1 : 0}

# HELP database_latency_ms Database query latency in milliseconds
# TYPE database_latency_ms gauge
database_latency_ms ${dbHealth.latency}

# HELP cache_health Cache health status (1 = healthy, 0 = unhealthy)
# TYPE cache_health gauge
cache_health ${cacheHealth.healthy ? 1 : 0}

# HELP cache_latency_ms Cache query latency in milliseconds
# TYPE cache_latency_ms gauge
cache_latency_ms ${cacheHealth.latency}
`.trim();

  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(metrics);
});

// ============================================================
// VERSION ENDPOINT
// ============================================================

/**
 * GET /version
 *
 * Returns application version information.
 */
router.get('/version', (_req: Request, res: Response) => {
  res.json({
    version: process.env.APP_VERSION || '1.0.0',
    build: process.env.BUILD_NUMBER || 'local',
    commit: process.env.GIT_COMMIT || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

export default router;
