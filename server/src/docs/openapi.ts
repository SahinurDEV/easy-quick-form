// OpenAPI 3.0 specification, served as interactive docs at GET /api/docs.
const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Easy Quick Form API',
    version: '1.0.0',
    description:
      'REST API for building dynamic forms and tracking their responses. Sign-in is Google-only (POST /auth/google); the old email/password endpoints return 410 Gone.',
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
  },
  servers: [{ url: '/api/v1', description: 'API v1' }],
  tags: [
    { name: 'Auth' },
    { name: 'User' },
    { name: 'Forms' },
    { name: 'Form Responses' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'fail' },
          message: { type: 'string' },
          errors: { type: 'object', additionalProperties: true },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          accessToken: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          avatar: { type: 'string', nullable: true },
        },
      },
    },
  },
  paths: {
    '/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Log in / sign up with a Google authorization code',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code'],
                properties: { code: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/refresh': {
      get: {
        tags: ['Auth'],
        summary: 'Rotate the refresh-token cookie and get a new access token',
        responses: {
          200: { description: 'OK' },
          401: { description: 'No refresh token' },
          403: { description: 'Invalid / reused refresh token' },
        },
      },
    },
    '/auth/logout': {
      get: {
        tags: ['Auth'],
        summary: 'Log out (clears the refresh-token cookie)',
        responses: { 204: { description: 'No Content' } },
      },
    },
    '/user/profile': {
      get: {
        tags: ['User'],
        summary: 'Get the current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: ['User'],
        summary: 'Update profile (name, email, avatar)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  avatar: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/user/delete-account': {
      delete: {
        tags: ['User'],
        summary: 'Soft-delete the current account',
        security: [{ bearerAuth: [] }],
        responses: { 204: { description: 'No Content' } },
      },
    },
    '/forms': {
      get: {
        tags: ['Forms'],
        summary: 'List forms (paginated, sortable, searchable)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer' } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['Forms'],
        summary: 'Create a form',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Created' } },
      },
    },
    '/forms/bulk-delete': {
      patch: {
        tags: ['Forms'],
        summary: 'Delete multiple forms',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/forms/{id}': {
      get: {
        tags: ['Forms'],
        summary: 'Get a form by id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found' },
        },
      },
      patch: {
        tags: ['Forms'],
        summary: 'Update a form',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'OK' } },
      },
      delete: {
        tags: ['Forms'],
        summary: 'Delete a form',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 204: { description: 'No Content' } },
      },
    },
    '/forms/{id}/responses': {
      get: {
        tags: ['Form Responses'],
        summary: 'List responses for a form',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['Form Responses'],
        summary: 'Submit a response to a form',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 201: { description: 'Created' } },
      },
    },
  },
} as const;

export default openapiSpec;
