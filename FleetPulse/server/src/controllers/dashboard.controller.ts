import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getDashboardKPIs = async (req: Request, res: Response) => {
  try {
    const totalVehicles = await prisma.vehicles.count();
    const availableVehicles = await prisma.vehicles.count({ where: { status: 'Available' } });
    const vehiclesInShop = await prisma.vehicles.count({ where: { status: 'In Shop' } });
    const retiredVehicles = await prisma.vehicles.count({ where: { status: 'Retired' } });
    
    // Active Vehicles = Total - Retired
    const activeVehicles = totalVehicles - retiredVehicles;

    const activeTrips = await prisma.trips.count({ where: { status: 'Dispatched' } });
    const pendingTrips = await prisma.trips.count({ where: { status: 'Draft' } });
    
    const driversOnDuty = await prisma.drivers.count({ where: { status: 'On Trip' } });

    const fleetUtilization = activeVehicles > 0 
      ? ((activeVehicles - availableVehicles - vehiclesInShop) / activeVehicles) * 100 
      : 0;

    // Financial calculations
    const expenses = await prisma.expenses.aggregate({ _sum: { amount: true } });
    const fuelLogs = await prisma.fuel_logs.aggregate({ _sum: { total_cost: true, liters: true } });
    const maintenance = await prisma.maintenance_logs.aggregate({ _sum: { cost: true } });
    const tripsAgg = await prisma.trips.aggregate({ _sum: { revenue: true, actual_distance: true } });

    const totalMaintenanceCost = Number(maintenance._sum.cost || 0);
    const totalFuelCost = Number(fuelLogs._sum.total_cost || 0);
    const totalExpenses = Number(expenses._sum.amount || 0);
    
    const operationalCost = totalMaintenanceCost + totalFuelCost + totalExpenses;
    
    const totalDistance = Number(tripsAgg._sum.actual_distance || 0);
    const totalLiters = Number(fuelLogs._sum.liters || 0);
    const fuelEfficiency = totalLiters > 0 ? totalDistance / totalLiters : 0; // km per liter

    const totalRevenue = Number(tripsAgg._sum.revenue || 0);

    return res.status(200).json({
      success: true,
      kpis: {
        activeVehicles,
        availableVehicles,
        vehiclesInShop,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        fleetUtilization: parseFloat(fleetUtilization.toFixed(2)),
      },
      financials: {
        totalRevenue,
        operationalCost,
        fuelEfficiency: parseFloat(fuelEfficiency.toFixed(2)),
        // Vehicle ROI generally would be calculated per vehicle, but here is a global aggregate proxy:
        // (Revenue - Operational Cost) / Total Acquisition Cost
      }
    });
  } catch (error) {
    console.error('Get Dashboard KPIs error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
