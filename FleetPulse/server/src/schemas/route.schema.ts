import { z } from 'zod';

export const routeSchema = z.object({
  route_name: z.string().min(1, 'Route name is required'),
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  distance: z.number().positive('Distance must be positive'),
  estimated_hours: z.number().positive('Estimated hours must be positive').optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

export const updateRouteSchema = routeSchema.partial();
