import { Request, Response } from 'express';
import { prisma } from '../config/db';

const formatUptime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
};

export const getHealthStatus = async (req: Request, res: Response) => {
  const uptime = process.uptime();
  
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      success: true,
      message: 'Server is healthy and connected to database.',
      databaseConnected: true,
      uptime,
      uptimeFormatted: formatUptime(uptime),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Server is running, but database connection failed.',
      databaseConnected: false,
      uptime,
      uptimeFormatted: formatUptime(uptime),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
