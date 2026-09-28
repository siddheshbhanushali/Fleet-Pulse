import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { createMaintenanceSchema, completeMaintenanceSchema } from '../schemas/maintenance.schema';
import { z } from 'zod';

export const createMaintenanceLog = async (req: Request, res: Response) => {
  try {
    const data = createMaintenanceSchema.parse(req.body);
    const userId = req.user!.userId;

    const vehicle = await prisma.vehicles.findUnique({ where: { id: data.vehicle_id } });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    if (vehicle.status === 'Retired') {
      return res.status(400).json({ success: false, message: 'Cannot maintain a retired vehicle' });
    }
    
    if (vehicle.status === 'On Trip') {
      return res.status(400).json({ success: false, message: 'Cannot maintain a vehicle currently on a trip' });
    }

    const isCreatingActive = data.status === 'In Progress' || data.status === 'Scheduled';

    const log = await prisma.$transaction(async (tx) => {
      const newLog = await tx.maintenance_logs.create({
        data: {
          ...data,
          maintenance_date: new Date(data.maintenance_date),
          created_by: userId,
        },
      });

      if (isCreatingActive) {
        await tx.vehicles.update({
          where: { id: data.vehicle_id },
          data: { status: 'In Shop', updated_at: new Date() },
        });
      }

      return newLog;
    });

    return res.status(201).json({ success: true, maintenance_log: log });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Create maintenance error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const completeMaintenanceLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = completeMaintenanceSchema.parse(req.body);

    const log = await prisma.maintenance_logs.findUnique({ where: { id: parseInt(id as string) } });
    if (!log) return res.status(404).json({ success: false, message: 'Maintenance log not found' });

    if (log.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Maintenance log is already completed' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.maintenance_logs.update({
        where: { id: log.id },
        data: {
          ...data,
          status: 'Completed',
          completion_date: new Date(data.completion_date),
          updated_at: new Date(),
        },
      });

      // Restore vehicle to available
      const vehicle = await tx.vehicles.findUnique({ where: { id: log.vehicle_id } });
      if (vehicle && vehicle.status === 'In Shop') {
        await tx.vehicles.update({
          where: { id: vehicle.id },
          data: { status: 'Available', updated_at: new Date() },
        });
      }
    });

    return res.status(200).json({ success: true, message: 'Maintenance completed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Complete maintenance error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMaintenanceLogs = async (req: Request, res: Response) => {
  try {
    const { vehicle_id } = req.query;
    const filters: any = {};
    if (vehicle_id) filters.vehicle_id = parseInt(vehicle_id as string);

    const logs = await prisma.maintenance_logs.findMany({
      where: filters,
      orderBy: { created_at: 'desc' },
      include: {
        vehicles: { select: { registration_number: true, vehicle_name: true } },
      }
    });

    return res.status(200).json({ success: true, maintenance_logs: logs });
  } catch (error) {
    console.error('Get maintenance logs error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
