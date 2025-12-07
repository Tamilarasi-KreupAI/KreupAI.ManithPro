import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

// ============================================================
// SWAGGER/OPENAPI DOCUMENTATION SETUP
// ============================================================
//
// This module configures Swagger UI for API documentation.
// The OpenAPI specification is loaded from openapi.yaml.
//
// Features:
// - Interactive API documentation
// - Try-it-out functionality
// - Authentication support
// - Multiple server environments
// ============================================================

// ============================================================
// CONFIGURATION
// ============================================================

const swaggerOptions: swaggerUi.SwaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { font-size: 2rem; }
    .swagger-ui .scheme-container { padding: 20px 0; }
  `,
  customSiteTitle: 'ManithPro API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    syntaxHighlight: {
      theme: 'monokai',
    },
  },
};

// ============================================================
// LOAD OPENAPI SPECIFICATION
// ============================================================

function loadOpenApiSpec(): object {
  const specPath = path.join(__dirname, 'openapi.yaml');

  try {
    const fileContents = fs.readFileSync(specPath, 'utf8');
    const spec = yaml.load(fileContents) as object;
    return spec;
  } catch (error) {
    console.error('Failed to load OpenAPI specification:', error);

    // Return a minimal fallback spec
    return {
      openapi: '3.1.0',
      info: {
        title: 'ManithPro API',
        version: '1.0.0',
        description: 'API documentation unavailable',
      },
      paths: {},
    };
  }
}

// ============================================================
// SETUP FUNCTION
// ============================================================

export function setupSwagger(app: Application): void {
  const spec = loadOpenApiSpec();

  // Serve OpenAPI spec as JSON
  app.get('/api/docs/openapi.json', (_req, res) => {
    res.json(spec);
  });

  // Serve OpenAPI spec as YAML
  app.get('/api/docs/openapi.yaml', (_req, res) => {
    res.setHeader('Content-Type', 'text/yaml');
    res.send(yaml.dump(spec));
  });

  // Serve Swagger UI
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, swaggerOptions)
  );

  // Redirect /docs to /api/docs
  app.get('/docs', (_req, res) => {
    res.redirect('/api/docs');
  });

  console.info('✅ Swagger documentation available at /api/docs');
}

// ============================================================
// EXPORTS
// ============================================================

export default { setupSwagger };
