import { z } from 'zod';
import { insertUserSchema, insertEventSchema, insertMediaSchema, insertReactionSchema, users, events, media, reactions } from './schema';

// Error Schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
};

// API Contract
export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  admin: {
    users: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/users' as const,
        responses: {
          200: z.array(z.custom<typeof users.$inferSelect>()),
          403: errorSchemas.forbidden,
        },
      },
      approve: {
        method: 'PATCH' as const,
        path: '/api/admin/users/:id/approve' as const,
        input: z.object({ isApproved: z.boolean() }),
        responses: {
          200: z.custom<typeof users.$inferSelect>(),
          403: errorSchemas.forbidden,
        },
      },
      updateRole: {
        method: 'PATCH' as const,
        path: '/api/admin/users/:id/role' as const,
        input: z.object({ role: z.enum(['user', 'co-admin']) }),
        responses: {
          200: z.custom<typeof users.$inferSelect>(),
          403: errorSchemas.forbidden,
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/users/:id' as const,
        responses: {
          204: z.void(),
          403: errorSchemas.forbidden,
        },
      },
    }
  },
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events' as const,
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect & { creator: typeof users.$inferSelect }>()),
        403: errorSchemas.forbidden,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events' as const,
      input: insertEventSchema,
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        403: errorSchemas.forbidden,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/events/:id' as const,
      responses: {
        200: z.custom<typeof events.$inferSelect & { media: (typeof media.$inferSelect & { reactions: typeof reactions.$inferSelect[] })[] }>(),
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/events/:id' as const,
      input: insertEventSchema.partial(),
      responses: {
        200: z.custom<typeof events.$inferSelect>(),
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/events/:id' as const,
      responses: {
        204: z.void(),
        403: errorSchemas.forbidden,
      },
    }
  },
  media: {
    upload: {
      method: 'POST' as const,
      path: '/api/events/:eventId/media' as const,
      responses: {
        201: z.custom<typeof media.$inferSelect>(),
        403: errorSchemas.forbidden,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/media/:id' as const,
      responses: {
        204: z.void(),
        403: errorSchemas.forbidden,
      },
    },
    react: {
      method: 'POST' as const,
      path: '/api/media/:id/react' as const,
      input: z.object({ reactionType: z.string() }),
      responses: {
        201: z.custom<typeof reactions.$inferSelect>(),
        403: errorSchemas.forbidden,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
