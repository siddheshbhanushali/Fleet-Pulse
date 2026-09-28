import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { fuelLogSchema, expenseSchema } from '../schemas/expense.schema';
import { ZodError } from 'zod';

export const createFuelLog = async (req: Request, res: Response) => {
  try {
    const data = fuelLogSchema.parse(req.body);

    const vehicle = await prisma.vehicles.findUnique({ where: { id: data.vehicle_id } });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const total_cost = data.liters * data.price_per_liter;

    await prisma.$transaction(async (tx) => {
      await tx.fuel_logs.create({
        data: {
          ...data,
          total_cost,
          fuel_date: new Date(data.fuel_date),
        },
      });

      if (data.odometer > (vehicle.current_odometer || 0)) {
        await tx.vehicles.update({
          where: { id: vehicle.id },
          data: { current_odometer: data.odometer, updated_at: new Date() },
        });
      }
    });

    return res.status(201).json({ success: true, message: 'Fuel log created successfully' });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Create fuel log error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const data = expenseSchema.parse(req.body);

    const vehicle = await prisma.vehicles.findUnique({ where: { id: data.vehicle_id } });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const expense = await prisma.expenses.create({
      data: {
        ...data,
        expense_date: new Date(data.expense_date),
      },
    });

    return res.status(201).json({ success: true, expense });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Create expense error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getFuelLogs = async (req: Request, res: Response) => {
  try {
    const { vehicle_id } = req.query;
    const filters: any = {};
    if (vehicle_id) filters.vehicle_id = parseInt(vehicle_id as string);

    const logs = await prisma.fuel_logs.findMany({
      where: filters,
      orderBy: { created_at: 'desc' },
      include: {
        vehicles: { select: { registration_number: true, vehicle_name: true } },
      }
    });

    return res.status(200).json({ success: true, fuel_logs: logs });
  } catch (error) {
    console.error('Get fuel logs error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { vehicle_id } = req.query;
    const filters: any = {};
    if (vehicle_id) filters.vehicle_id = parseInt(vehicle_id as string);

    const expenses = await prisma.expenses.findMany({
      where: filters,
      orderBy: { created_at: 'desc' },
      include: {
        vehicles: { select: { registration_number: true, vehicle_name: true } },
      }
    });

    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
