import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { createTripSchema, completeTripSchema } from '../schemas/trip.schema';
import { ZodError } from 'zod';

export const createTrip = async (req: Request, res: Response) => {
  try {
    const data = createTripSchema.parse(req.body);
    const userId = req.user!.userId;
    const roleId = req.user!.roleId;

    if (roleId !== 1 && roleId !== 2) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions to create trips' });
    }

    // Validate vehicle and driver capacity
    const vehicle = await prisma.vehicles.findUnique({ where: { id: data.vehicle_id } });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    
    if (vehicle.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Vehicle is not available' });
    }

    if (data.cargo_weight > Number(vehicle.max_load_capacity)) {
      return res.status(400).json({ success: false, message: 'Cargo weight exceeds vehicle capacity' });
    }

    const driver = await prisma.drivers.findUnique({ where: { id: data.driver_id } });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    if (driver.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Driver is not available' });
    }

    if (new Date(driver.license_expiry_date) < new Date()) {
      return res.status(400).json({ success: false, message: 'Driver license is expired' });
    }

    const trip = await prisma.trips.create({
      data: {
        ...data,
        planned_start: new Date(data.planned_start),
        route_id: data.route_id || null,
        created_by: userId,
        status: 'Draft',
      },
    });

    return res.status(201).json({ success: true, trip });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Create trip error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const dispatchTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trips.findUnique({ where: { id: parseInt(id as string) } });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (trip.status !== 'Draft') {
      return res.status(400).json({ success: false, message: 'Only Draft trips can be dispatched' });
    }

    // Transaction to update trip, driver, and vehicle status
    await prisma.$transaction(async (tx) => {
      // Re-verify availability within transaction
      const v = await tx.vehicles.findUnique({ where: { id: trip.vehicle_id } });
      const d = await tx.drivers.findUnique({ where: { id: trip.driver_id } });

      if (v?.status !== 'Available') throw new Error('Vehicle no longer available');
      if (d?.status !== 'Available') throw new Error('Driver no longer available');

      await tx.trips.update({
        where: { id: trip.id },
        data: { status: 'Dispatched', actual_start: new Date(), updated_at: new Date() },
      });

      await tx.vehicles.update({
        where: { id: trip.vehicle_id },
        data: { status: 'On Trip', updated_at: new Date() },
      });

      await tx.drivers.update({
        where: { id: trip.driver_id },
        data: { status: 'On Trip', updated_at: new Date() },
      });
    });

    return res.status(200).json({ success: true, message: 'Trip dispatched successfully' });
  } catch (error: any) {
    console.error('Dispatch trip error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const completeTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = completeTripSchema.parse(req.body);

    const trip = await prisma.trips.findUnique({ where: { id: parseInt(id as string) } });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ success: false, message: 'Only Dispatched trips can be completed' });
    }

    if (data.end_odometer < trip.start_odometer) {
      return res.status(400).json({ success: false, message: `End odometer (${data.end_odometer}) cannot be less than start odometer (${trip.start_odometer})` });
    }

    const actual_distance = data.actual_distance ?? (data.end_odometer - trip.start_odometer);
    const actual_end = data.actual_end ? new Date(data.actual_end) : new Date();

    await prisma.$transaction(async (tx) => {
      await tx.trips.update({
        where: { id: trip.id },
        data: {
          ...data,
          actual_distance,
          actual_end,
          status: 'Completed',
          updated_at: new Date(),
        },
      });

      await tx.vehicles.update({
        where: { id: trip.vehicle_id },
        data: { status: 'Available', current_odometer: data.end_odometer, updated_at: new Date() },
      });

      await tx.drivers.update({
        where: { id: trip.driver_id },
        data: { status: 'Available', updated_at: new Date() },
      });
    });

    return res.status(200).json({ success: true, message: 'Trip completed successfully' });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Complete trip error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const cancelTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trips.findUnique({ where: { id: parseInt(id as string) } });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${trip.status} trip` });
    }

    await prisma.$transaction(async (tx) => {
      await tx.trips.update({
        where: { id: trip.id },
        data: { status: 'Cancelled', updated_at: new Date() },
      });

      if (trip.status === 'Dispatched') {
        await tx.vehicles.update({
          where: { id: trip.vehicle_id },
          data: { status: 'Available', updated_at: new Date() },
        });

        await tx.drivers.update({
          where: { id: trip.driver_id },
          data: { status: 'Available', updated_at: new Date() },
        });
      }
    });

    return res.status(200).json({ success: true, message: 'Trip cancelled successfully' });
  } catch (error) {
    console.error('Cancel trip error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getTrips = async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.user!;
    let whereClause: any = {};

    if (roleId === 3) {
      const user = await prisma.users.findUnique({ where: { id: userId } });
      if (!user || !user.email) {
        return res.status(200).json({ success: true, trips: [] });
      }
      
      const driver = await prisma.drivers.findUnique({ where: { email: user.email } });
      if (!driver) {
        return res.status(200).json({ success: true, trips: [] });
      }
      whereClause.driver_id = driver.id;
    }

    const trips = await prisma.trips.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      include: {
        vehicles: { select: { vehicle_name: true, registration_number: true } },
        drivers: { select: { first_name: true, last_name: true } },
      }
    });

    return res.status(200).json({ success: true, trips });
  } catch (error) {
    console.error('Get trips error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
