import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { driverSchema, updateDriverSchema } from '../schemas/driver.schema';
import { ZodError } from 'zod';

export const createDriver = async (req: Request, res: Response) => {
  try {
    const data = driverSchema.parse(req.body);

    const existing = await prisma.drivers.findFirst({
      where: {
        OR: [
          { license_number: data.license_number },
          { phone: data.phone },
        ],
      },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'License number or Phone already exists' });
    }

    const driver = await prisma.drivers.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
        emergency_contact: data.emergency_contact,
        license_number: data.license_number,
        license_category: data.license_category,
        license_issue_date: new Date(data.license_issue_date),
        license_expiry_date: new Date(data.license_expiry_date),
        safety_score: data.safety_score,
        status: data.status,
        joining_date: data.joining_date ? new Date(data.joining_date) : undefined,
        notes: data.notes,
      },
    });

    return res.status(201).json({ success: true, driver });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Create driver error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDrivers = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    const filters: any = {};
    if (status) filters.status = status;

    const drivers = await prisma.drivers.findMany({
      where: filters,
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json({ success: true, drivers });
  } catch (error) {
    console.error('Get drivers error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDriverById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const driver = await prisma.drivers.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    return res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error('Get driver error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateDriverSchema.parse(req.body);

    const driver = await prisma.drivers.findUnique({ where: { id: parseInt(id as string) } });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (data.license_number && data.license_number !== driver.license_number) {
      const existing = await prisma.drivers.findUnique({
        where: { license_number: data.license_number },
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'License number already exists' });
      }
    }

    const updated = await prisma.drivers.update({
      where: { id: parseInt(id as string) },
      data: {
        ...data,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
        license_issue_date: data.license_issue_date ? new Date(data.license_issue_date) : undefined,
        license_expiry_date: data.license_expiry_date ? new Date(data.license_expiry_date) : undefined,
        joining_date: data.joining_date ? new Date(data.joining_date) : undefined,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({ success: true, driver: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Update driver error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const driver = await prisma.drivers.findUnique({ where: { id: parseInt(id as string) } });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Soft delete / Suspend
    const updated = await prisma.drivers.update({
      where: { id: parseInt(id as string) },
      data: { status: 'Suspended', updated_at: new Date() },
    });

    return res.status(200).json({ success: true, message: 'Driver suspended successfully', driver: updated });
  } catch (error) {
    console.error('Delete driver error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
