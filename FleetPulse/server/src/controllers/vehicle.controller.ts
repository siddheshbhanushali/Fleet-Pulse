import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { vehicleSchema, updateVehicleSchema } from '../schemas/vehicle.schema';
import { ZodError } from 'zod';

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const data = vehicleSchema.parse(req.body);

    const existing = await prisma.vehicles.findUnique({
      where: { registration_number: data.registration_number },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Registration number already exists' });
    }

    const vehicle = await prisma.vehicles.create({
      data: {
        registration_number: data.registration_number,
        vehicle_name: data.vehicle_name,
        model: data.model,
        manufacturer: data.manufacturer,
        manufacture_year: data.manufacture_year,
        vehicle_type: data.vehicle_type,
        max_load_capacity: data.max_load_capacity,
        acquisition_cost: data.acquisition_cost,
        fuel_type: data.fuel_type,
        current_odometer: data.current_odometer || 0,
        status: data.status,
        region: data.region,
        notes: data.notes,
        purchase_date: data.purchase_date ? new Date(data.purchase_date) : undefined,
      },
    });

    return res.status(201).json({ success: true, vehicle });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Create vehicle error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const { status, type, region } = req.query;
    
    const filters: any = {};
    if (status) filters.status = status;
    if (type) filters.vehicle_type = type;
    if (region) filters.region = region;

    const vehicles = await prisma.vehicles.findMany({
      where: filters,
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json({ success: true, vehicles });
  } catch (error) {
    console.error('Get vehicles error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicles.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    return res.status(200).json({ success: true, vehicle });
  } catch (error) {
    console.error('Get vehicle error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateVehicleSchema.parse(req.body);

    const vehicle = await prisma.vehicles.findUnique({ where: { id: parseInt(id as string) } });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (data.registration_number && data.registration_number !== vehicle.registration_number) {
      const existing = await prisma.vehicles.findUnique({
        where: { registration_number: data.registration_number },
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Registration number already exists' });
      }
    }

    const updated = await prisma.vehicles.update({
      where: { id: parseInt(id as string) },
      data: {
        ...data,
        purchase_date: data.purchase_date ? new Date(data.purchase_date) : undefined,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({ success: true, vehicle: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Update vehicle error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const vehicle = await prisma.vehicles.findUnique({ where: { id: parseInt(id as string) } });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Instead of hard deleting, we could mark as Retired, but let's just delete for simplicity if desired
    // The requirement says: "Retired or In Shop vehicles must never appear in dispatch selection."
    // Let's implement Soft Delete by setting status to 'Retired'.
    const updated = await prisma.vehicles.update({
      where: { id: parseInt(id as string) },
      data: { status: 'Retired', updated_at: new Date() },
    });

    return res.status(200).json({ success: true, message: 'Vehicle retired successfully', vehicle: updated });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
