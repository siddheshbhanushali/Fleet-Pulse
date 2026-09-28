import { z } from 'zod';

export const driverSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
  date_of_birth: z.string().datetime().optional().or(z.date().optional()),
  emergency_contact: z.string().optional(),
  license_number: z.string().min(1, 'License number is required'),
  license_category: z.string().min(1, 'License category is required'),
  license_issue_date: z.string().datetime().or(z.date()),
  license_expiry_date: z.string().datetime().or(z.date()),
  safety_score: z.number().min(0).max(100).optional(),
  status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']),
  joining_date: z.string().datetime().optional().or(z.date().optional()),
  notes: z.string().optional(),
});

export const updateDriverSchema = driverSchema.partial();
