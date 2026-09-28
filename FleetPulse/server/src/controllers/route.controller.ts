import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { routeSchema, updateRouteSchema } from '../schemas/route.schema';
import { z } from 'zod';

export const createRoute = async (req: Request, res: Response) => {
  try {
    const data = routeSchema.parse(req.body);

    const newRoute = await prisma.routes.create({
      data: {
        route_name: data.route_name,
        source: data.source,
        destination: data.destination,
        distance: data.distance,
        estimated_hours: data.estimated_hours || null,
        status: data.status || 'Active',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Route created successfully',
      route: newRoute,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Create route error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRoutes = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = String(status);

    const routes = await prisma.routes.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json({
      success: true,
      routes,
    });
  } catch (error) {
    console.error('Get routes error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateRoute = async (req: Request, res: Response) => {
  try {
    const routeId = parseInt(req.params.id as string);
    if (isNaN(routeId)) {
      return res.status(400).json({ success: false, message: 'Invalid route ID' });
    }

    const data = updateRouteSchema.parse(req.body);

    const updatedRoute = await prisma.routes.update({
      where: { id: routeId },
      data,
    });

    return res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      route: updatedRoute,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Update route error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteRoute = async (req: Request, res: Response) => {
  try {
    const routeId = parseInt(req.params.id as string);
    if (isNaN(routeId)) {
      return res.status(400).json({ success: false, message: 'Invalid route ID' });
    }

    await prisma.routes.delete({
      where: { id: routeId },
    });

    return res.status(200).json({
      success: true,
      message: 'Route deleted successfully',
    });
  } catch (error) {
    console.error('Delete route error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
