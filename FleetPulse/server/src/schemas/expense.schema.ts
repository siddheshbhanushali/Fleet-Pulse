import { z } from 'zod';

export const fuelLogSchema = z.object({
  vehicle_id: z.number().int(),
  trip_id: z.number().int().optional(),
  liters: z.number().positive(),
  price_per_liter: z.number().positive(),
  odometer: z.number().int().nonnegative(),
  fuel_station: z.string().optional(),
  fuel_date: z.string().datetime().or(z.date()),
});

export const expenseSchema = z.object({
  vehicle_id: z.number().int(),
  trip_id: z.number().int().optional(),
  expense_type: z.string().min(1, 'Expense type is required'),
  amount: z.number().positive(),
  description: z.string().optional(),
  expense_date: z.string().datetime().or(z.date()),
});
