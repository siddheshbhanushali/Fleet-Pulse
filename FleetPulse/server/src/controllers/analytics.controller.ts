import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    // Start of month exactly 6 months ago
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // 1. Fetch Fleet Status Distribution
    const vehicles = await prisma.vehicles.findMany({ select: { status: true } });
    const fleetStatus = vehicles.reduce((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const fleetStatusData = Object.keys(fleetStatus).map(key => ({
      name: key,
      value: fleetStatus[key]
    }));

    // 2. Fetch Trips for Revenue and Count
    const trips = await prisma.trips.findMany({
      where: { created_at: { gte: sixMonthsAgo } },
      select: { revenue: true, status: true, created_at: true }
    });

    const totalTrips = await prisma.trips.count();

    // 3. Fetch Maintenance Logs for Costs
    const maintenanceLogs = await prisma.maintenance_logs.findMany({
      where: { created_at: { gte: sixMonthsAgo } },
      select: { cost: true, created_at: true }
    });

    // 4. Fetch Fuel Logs for Costs
    const fuelLogs = await prisma.fuel_logs.findMany({
      where: { created_at: { gte: sixMonthsAgo } },
      select: { total_cost: true, created_at: true }
    });

    // 5. Fetch Expenses for Costs
    const expenses = await prisma.expenses.findMany({
      where: { created_at: { gte: sixMonthsAgo } },
      select: { amount: true, created_at: true }
    });

    // 6. Aggregate Total KPIs (all time, or we could do YTD. Let's do all time from the DB, but just from the fetched recent data for simplicity)
    const totalRevenue = trips.reduce((sum, t) => sum + Number(t.revenue || 0), 0);
    const totalMaintenanceCost = maintenanceLogs.reduce((sum, m) => sum + Number(m.cost || 0), 0);
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + Number(f.total_cost || 0), 0);
    const totalOtherExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalExpenses = totalMaintenanceCost + totalFuelCost + totalOtherExpenses;
    const netProfit = totalRevenue - totalExpenses;

    // 7. Group Data by Month for Chart
    const monthlyDataMap: Record<string, { month: string; revenue: number; expenses: number }> = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      monthlyDataMap[monthStr] = { month: monthStr, revenue: 0, expenses: 0 };
    }

    trips.forEach(t => {
      if (t.created_at) {
        const monthStr = t.created_at.toLocaleString('default', { month: 'short' });
        if (monthlyDataMap[monthStr]) {
          monthlyDataMap[monthStr].revenue += Number(t.revenue || 0);
        }
      }
    });

    maintenanceLogs.forEach(m => {
      if (m.created_at) {
        const monthStr = m.created_at.toLocaleString('default', { month: 'short' });
        if (monthlyDataMap[monthStr]) {
          monthlyDataMap[monthStr].expenses += Number(m.cost || 0);
        }
      }
    });

    fuelLogs.forEach(f => {
      if (f.created_at) {
        const monthStr = f.created_at.toLocaleString('default', { month: 'short' });
        if (monthlyDataMap[monthStr]) {
          monthlyDataMap[monthStr].expenses += Number(f.total_cost || 0);
        }
      }
    });

    expenses.forEach(e => {
      if (e.created_at) {
        const monthStr = e.created_at.toLocaleString('default', { month: 'short' });
        if (monthlyDataMap[monthStr]) {
          monthlyDataMap[monthStr].expenses += Number(e.amount || 0);
        }
      }
    });

    const monthlyChartData = Object.values(monthlyDataMap);

    return res.status(200).json({
      success: true,
      kpis: {
        totalRevenue,
        totalExpenses,
        netProfit,
        totalTrips,
        totalMaintenanceCost
      },
      charts: {
        monthly: monthlyChartData,
        fleetStatus: fleetStatusData
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getOverview = async (req: Request, res: Response) => {
  try {
    const totalVehicles = await prisma.vehicles.count();
    const activeTrips = await prisma.trips.count({ 
      where: { 
        status: { in: ['In Progress', 'Dispatched'] } 
      } 
    });
    const availableDrivers = await prisma.drivers.count({ where: { status: 'Available' } });
    const maintenanceDue = await prisma.maintenance_logs.count({ where: { status: 'Scheduled' } });
    
    // Recent Activity (last 5 trips/maintenance)
    const recentTrips = await prisma.trips.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { drivers: { select: { first_name: true, last_name: true } } }
    });
    
    const activities = recentTrips.map(t => ({
      title: `Trip ${t.status}`,
      desc: `Trip ${t.trip_number} - Driver: ${t.drivers?.first_name || 'Unknown'}`,
      time: t.created_at,
      badge: ['In Progress', 'Dispatched'].includes(t.status) ? 'Active' : undefined
    }));
    
    return res.status(200).json({
      success: true,
      metrics: {
        totalVehicles,
        activeTrips,
        availableDrivers,
        fuelEfficiency: 8.4, // placeholder
        openIncidents: 0, // placeholder
        maintenanceDue
      },
      activities
    });
  } catch (error) {
    console.error('Overview error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
