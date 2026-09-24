import { environment } from 'effect/Differ';
import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const createIncidentSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title required'),
    description: z.string().min(5, 'Description required'),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  }),
});

export const updateIncidentSchema = z.object({
  body: z.object({
    environment: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    servicestatus: z.enum(['HEALTHY', 'DEGRADED', 'DOWN']).optional(),
  }),
});
