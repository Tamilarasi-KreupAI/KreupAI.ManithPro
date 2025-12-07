// Batch 36: Developer Tools & API Controller (10.4.1-10.4.8)
import { Request, Response } from 'express';

// ==========================================
// API Key Controllers
// ==========================================

// Get all API keys
export const getAPIKeys = async (req: Request, res: Response) => {
  try {
    const { isActive, environment } = req.query;

    const apiKeys = [
      {
        id: 'key-001',
        organizationId: 'org-001',
        name: 'Production API Key',
        keyPrefix: 'krup_live_',
        scopes: ['read:jobs', 'write:jobs', 'read:candidates', 'write:applications'],
        rateLimit: 1000,
        rateLimitPeriod: 'hour',
        isActive: true,
        environment: 'production',
        lastUsedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        usageCount: 15420,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'key-002',
        organizationId: 'org-001',
        name: 'Staging API Key',
        keyPrefix: 'krup_test_',
        scopes: ['read:all', 'write:all'],
        rateLimit: 5000,
        rateLimitPeriod: 'hour',
        isActive: true,
        environment: 'staging',
        lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        usageCount: 8520,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    res.json({
      success: true,
      apiKeys,
      total: apiKeys.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch API keys' });
  }
};

// Create API key
export const createAPIKey = async (req: Request, res: Response) => {
  try {
    const { name, scopes, rateLimit, environment, expiresAt, allowedIPs, description } = req.body;

    // Generate a new API key (in production, use proper crypto)
    const keyPrefix = environment === 'production' ? 'krup_live_' : 'krup_test_';
    const keyValue = keyPrefix + 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const apiKey = {
      id: `key-${Date.now()}`,
      organizationId: 'org-001',
      name,
      keyPrefix,
      keyValue, // Only returned on creation
      scopes: scopes || ['read:all'],
      rateLimit: rateLimit || 1000,
      rateLimitPeriod: 'hour',
      environment: environment || 'production',
      expiresAt,
      allowedIPs,
      ipRestricted: allowedIPs && allowedIPs.length > 0,
      description,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      apiKey,
      message: 'API key created. Save the key value - it will not be shown again.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create API key' });
  }
};

// Update API key
export const updateAPIKey = async (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;
    const { name, scopes, rateLimit, allowedIPs, isActive } = req.body;

    const apiKey = {
      id: keyId,
      name,
      scopes,
      rateLimit,
      allowedIPs,
      ipRestricted: allowedIPs && allowedIPs.length > 0,
      isActive,
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, apiKey });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update API key' });
  }
};

// Revoke API key
export const revokeAPIKey = async (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;

    res.json({ success: true, message: 'API key revoked', keyId });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to revoke API key' });
  }
};

// Get API key usage
export const getAPIKeyUsage = async (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;
    const { period = '7days' } = req.query;

    const usage = {
      keyId,
      period,
      summary: {
        totalRequests: 15420,
        successfulRequests: 15380,
        failedRequests: 40,
        avgResponseTime: 145,
        rateLimitHits: 5,
      },
      byEndpoint: [
        { endpoint: '/api/jobs', method: 'GET', count: 8500, avgTime: 120 },
        { endpoint: '/api/candidates', method: 'GET', count: 4200, avgTime: 180 },
        { endpoint: '/api/applications', method: 'POST', count: 2100, avgTime: 250 },
        { endpoint: '/api/jobs', method: 'POST', count: 620, avgTime: 300 },
      ],
      dailyUsage: [
        { date: '2024-12-01', requests: 2100, errors: 5 },
        { date: '2024-12-02', requests: 2250, errors: 8 },
        { date: '2024-12-03', requests: 2180, errors: 4 },
        { date: '2024-12-04', requests: 2320, errors: 6 },
        { date: '2024-12-05', requests: 2150, errors: 7 },
        { date: '2024-12-06', requests: 2420, errors: 5 },
      ],
    };

    res.json({ success: true, usage });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch usage' });
  }
};

// ==========================================
// Webhook Controllers
// ==========================================

// Get webhooks
export const getWebhooks = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;

    const webhooks = [
      {
        id: 'wh-001',
        organizationId: 'org-001',
        name: 'Application Notifications',
        url: 'https://api.example.com/webhooks/applications',
        events: ['application.created', 'application.updated', 'application.status_changed'],
        isActive: true,
        lastTriggeredAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        lastResponseCode: 200,
        totalSent: 1250,
        totalSuccess: 1245,
        totalFailed: 5,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'wh-002',
        organizationId: 'org-001',
        name: 'Interview Events',
        url: 'https://api.example.com/webhooks/interviews',
        events: ['interview.scheduled', 'interview.completed', 'interview.cancelled'],
        isActive: true,
        lastTriggeredAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        lastResponseCode: 200,
        totalSent: 450,
        totalSuccess: 448,
        totalFailed: 2,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    res.json({
      success: true,
      webhooks,
      total: webhooks.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch webhooks' });
  }
};

// Create webhook
export const createWebhook = async (req: Request, res: Response) => {
  try {
    const { name, url, events, headers, retryPolicy } = req.body;

    // Generate webhook secret
    const secret = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const webhook = {
      id: `wh-${Date.now()}`,
      organizationId: 'org-001',
      name,
      url,
      secret, // Only returned on creation
      events,
      headers,
      retryPolicy: retryPolicy || { maxRetries: 3, retryInterval: 60 },
      timeout: 30000,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      webhook,
      message: 'Webhook created. Save the secret - it will not be shown again.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create webhook' });
  }
};

// Update webhook
export const updateWebhook = async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;
    const updates = req.body;

    const webhook = {
      id: webhookId,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, webhook });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update webhook' });
  }
};

// Delete webhook
export const deleteWebhook = async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;

    res.json({ success: true, message: 'Webhook deleted', webhookId });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete webhook' });
  }
};

// Test webhook
export const testWebhook = async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;

    const testResult = {
      webhookId,
      success: true,
      responseCode: 200,
      responseTime: 245,
      responseBody: '{"received": true}',
      testedAt: new Date().toISOString(),
    };

    res.json({ success: true, testResult });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Webhook test failed' });
  }
};

// Get webhook deliveries
export const getWebhookDeliveries = async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;
    const { status, limit = 20 } = req.query;

    const deliveries = [
      {
        id: 'del-001',
        webhookId,
        eventType: 'application.created',
        eventId: 'evt-123',
        status: 'success',
        attemptNumber: 1,
        responseCode: 200,
        duration: 185,
        deliveredAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: 'del-002',
        webhookId,
        eventType: 'application.status_changed',
        eventId: 'evt-124',
        status: 'success',
        attemptNumber: 1,
        responseCode: 200,
        duration: 210,
        deliveredAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      {
        id: 'del-003',
        webhookId,
        eventType: 'application.created',
        eventId: 'evt-125',
        status: 'failed',
        attemptNumber: 3,
        responseCode: 500,
        duration: 30000,
        errorMessage: 'Server error',
        deliveredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
    ];

    res.json({
      success: true,
      deliveries,
      total: deliveries.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch deliveries' });
  }
};

// Retry webhook delivery
export const retryWebhookDelivery = async (req: Request, res: Response) => {
  try {
    const { deliveryId } = req.params;

    const delivery = {
      id: deliveryId,
      status: 'retrying',
      retryScheduledAt: new Date().toISOString(),
    };

    res.json({ success: true, delivery, message: 'Retry scheduled' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retry delivery' });
  }
};

// ==========================================
// Automation Integration Controllers
// ==========================================

// Get automation integrations
export const getAutomationIntegrations = async (req: Request, res: Response) => {
  try {
    const { platform, isActive } = req.query;

    const integrations = [
      {
        id: 'auto-001',
        organizationId: 'org-001',
        name: 'Zapier - New Applications',
        platform: 'zapier',
        connectionId: 'zap_conn_123',
        triggerCount: 5,
        actionCount: 3,
        isActive: true,
        lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        executionCount: 1250,
        successCount: 1245,
        failureCount: 5,
      },
      {
        id: 'auto-002',
        organizationId: 'org-001',
        name: 'Make - Interview Sync',
        platform: 'make',
        connectionId: 'make_conn_456',
        triggerCount: 2,
        actionCount: 4,
        isActive: true,
        lastActivityAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        executionCount: 450,
        successCount: 448,
        failureCount: 2,
      },
    ];

    res.json({
      success: true,
      integrations,
      total: integrations.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch integrations' });
  }
};

// Get available events
export const getAvailableEvents = async (req: Request, res: Response) => {
  try {
    const events = [
      {
        category: 'Applications',
        events: [
          { name: 'application.created', description: 'New application submitted' },
          { name: 'application.updated', description: 'Application information updated' },
          { name: 'application.status_changed', description: 'Application status changed' },
          { name: 'application.archived', description: 'Application archived' },
        ],
      },
      {
        category: 'Candidates',
        events: [
          { name: 'candidate.created', description: 'New candidate added' },
          { name: 'candidate.updated', description: 'Candidate information updated' },
          { name: 'candidate.merged', description: 'Candidate profiles merged' },
        ],
      },
      {
        category: 'Jobs',
        events: [
          { name: 'job.created', description: 'New job created' },
          { name: 'job.updated', description: 'Job details updated' },
          { name: 'job.published', description: 'Job published' },
          { name: 'job.closed', description: 'Job closed' },
        ],
      },
      {
        category: 'Interviews',
        events: [
          { name: 'interview.scheduled', description: 'Interview scheduled' },
          { name: 'interview.rescheduled', description: 'Interview rescheduled' },
          { name: 'interview.cancelled', description: 'Interview cancelled' },
          { name: 'interview.completed', description: 'Interview completed' },
        ],
      },
      {
        category: 'Offers',
        events: [
          { name: 'offer.created', description: 'Offer created' },
          { name: 'offer.sent', description: 'Offer sent to candidate' },
          { name: 'offer.accepted', description: 'Offer accepted' },
          { name: 'offer.declined', description: 'Offer declined' },
        ],
      },
      {
        category: 'Hires',
        events: [
          { name: 'hire.completed', description: 'Hire completed' },
          { name: 'hire.start_date', description: 'New hire start date' },
        ],
      },
    ];

    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
};

// Get API scopes
export const getAPIScopes = async (req: Request, res: Response) => {
  try {
    const scopes = [
      {
        category: 'Jobs',
        scopes: [
          { name: 'read:jobs', description: 'Read job listings' },
          { name: 'write:jobs', description: 'Create and update jobs' },
          { name: 'delete:jobs', description: 'Delete jobs' },
        ],
      },
      {
        category: 'Candidates',
        scopes: [
          { name: 'read:candidates', description: 'Read candidate profiles' },
          { name: 'write:candidates', description: 'Create and update candidates' },
          { name: 'delete:candidates', description: 'Delete candidates' },
        ],
      },
      {
        category: 'Applications',
        scopes: [
          { name: 'read:applications', description: 'Read applications' },
          { name: 'write:applications', description: 'Create and update applications' },
          { name: 'delete:applications', description: 'Delete applications' },
        ],
      },
      {
        category: 'Interviews',
        scopes: [
          { name: 'read:interviews', description: 'Read interview data' },
          { name: 'write:interviews', description: 'Schedule and update interviews' },
        ],
      },
      {
        category: 'Analytics',
        scopes: [
          { name: 'read:analytics', description: 'Read analytics and reports' },
        ],
      },
      {
        category: 'Admin',
        scopes: [
          { name: 'read:all', description: 'Read access to all resources' },
          { name: 'write:all', description: 'Write access to all resources' },
          { name: 'admin', description: 'Full administrative access' },
        ],
      },
    ];

    res.json({ success: true, scopes });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch scopes' });
  }
};

// Get API documentation info
export const getAPIDocumentation = async (req: Request, res: Response) => {
  try {
    const documentation = {
      version: 'v1',
      baseUrl: 'https://api.kreupai.com/v1',
      openApiSpec: '/api/v1/openapi.json',
      authentication: {
        type: 'Bearer',
        header: 'Authorization',
        example: 'Bearer krup_live_sk_xxxxx',
      },
      rateLimits: {
        default: { requests: 1000, period: 'hour' },
        premium: { requests: 10000, period: 'hour' },
      },
      endpoints: {
        jobs: '/api/v1/jobs',
        candidates: '/api/v1/candidates',
        applications: '/api/v1/applications',
        interviews: '/api/v1/interviews',
        offers: '/api/v1/offers',
      },
      sdks: {
        javascript: 'npm install @kreupai/sdk',
        python: 'pip install kreupai',
        ruby: 'gem install kreupai',
      },
    };

    res.json({ success: true, documentation });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch documentation' });
  }
};

// Get developer portal dashboard
export const getDeveloperPortalDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = {
      organization: {
        name: 'Acme Corp',
        plan: 'Enterprise',
        apiVersion: 'v1',
      },
      apiKeys: {
        total: 3,
        active: 2,
        expired: 1,
      },
      webhooks: {
        total: 5,
        active: 4,
        failureRate: 0.4,
      },
      usage: {
        today: 2420,
        thisWeek: 15200,
        thisMonth: 58400,
        rateLimit: 100000,
        rateLimitUsed: 58.4,
      },
      recentActivity: [
        { type: 'api_call', endpoint: '/api/jobs', method: 'GET', time: '2 min ago' },
        { type: 'webhook', event: 'application.created', status: 'success', time: '5 min ago' },
        { type: 'api_call', endpoint: '/api/candidates', method: 'POST', time: '8 min ago' },
      ],
    };

    res.json({ success: true, dashboard });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard' });
  }
};
