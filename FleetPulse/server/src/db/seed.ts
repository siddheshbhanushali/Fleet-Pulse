import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database with Indian transit data...');

  // 1. Roles
  const roles = [
    { id: 1, name: 'Admin',           description: 'Administrator with full access' },
    { id: 2, name: 'Fleet Manager',   description: 'Manages vehicles and drivers' },
    { id: 3, name: 'Driver',          description: 'Vehicle driver' },
    { id: 4, name: 'Finance Analyst', description: 'Views financial and analytics data' },
  ];

  for (const role of roles) {
    await prisma.roles.upsert({
      where: { id: role.id },
      update: role,
      create: role,
    });
  }

  // 2. Users
  const hash = await bcrypt.hash('password123', 10);
  const users = [
    { role_id: 1, first_name: 'Rajesh',  last_name: 'Sharma',  email: 'admin@fleetpulse.io',   password_hash: hash, phone: '9876543210', is_active: true },
    { role_id: 2, first_name: 'Priya',   last_name: 'Mehta',   email: 'manager@fleetpulse.io', password_hash: hash, phone: '9876543211', is_active: true },
    { role_id: 3, first_name: 'Arjun',   last_name: 'Nair',    email: 'driver@fleetpulse.io',  password_hash: hash, phone: '9876543212', is_active: true },
    { role_id: 4, first_name: 'Kavitha', last_name: 'Reddy',   email: 'analyst@fleetpulse.io', password_hash: hash, phone: '9876543213', is_active: true },
  ];

  for (const u of users) {
    await prisma.users.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
  }

  // 3. Vehicles
  const vehicles = [
    {
      registration_number: 'MH04GH1234',
      vehicle_name: 'Tata Prima 4028.S',
      model: 'Prima 4028.S',
      manufacturer: 'Tata Motors',
      manufacture_year: 2021,
      vehicle_type: 'Heavy Truck',
      max_load_capacity: 25000,
      acquisition_cost: 3500000,
      fuel_type: 'Diesel',
      current_odometer: 87450,
      status: 'Available',
      region: 'Maharashtra',
      purchase_date: new Date('2021-03-15'),
    },
    {
      registration_number: 'DL01CA5678',
      vehicle_name: 'Ashok Leyland 3518',
      model: '3518 IL',
      manufacturer: 'Ashok Leyland',
      manufacture_year: 2020,
      vehicle_type: 'Heavy Truck',
      max_load_capacity: 18000,
      acquisition_cost: 2800000,
      fuel_type: 'Diesel',
      current_odometer: 112340,
      status: 'In Progress',
      region: 'Delhi',
      purchase_date: new Date('2020-07-20'),
    },
    {
      registration_number: 'KA05MN9012',
      vehicle_name: 'Eicher Pro 6031',
      model: 'Pro 6031',
      manufacturer: 'Eicher',
      manufacture_year: 2022,
      vehicle_type: 'Medium Truck',
      max_load_capacity: 12000,
      acquisition_cost: 2100000,
      fuel_type: 'Diesel',
      current_odometer: 54200,
      status: 'Available',
      region: 'Karnataka',
      purchase_date: new Date('2022-01-10'),
    },
    {
      registration_number: 'GJ01RK3456',
      vehicle_name: 'BharatBenz 3523R',
      model: '3523R',
      manufacturer: 'BharatBenz',
      manufacture_year: 2019,
      vehicle_type: 'Heavy Truck',
      max_load_capacity: 23000,
      acquisition_cost: 3200000,
      fuel_type: 'Diesel',
      current_odometer: 198750,
      status: 'In Shop',
      region: 'Gujarat',
      purchase_date: new Date('2019-11-05'),
    },
    {
      registration_number: 'TN22AB7890',
      vehicle_name: 'Mahindra Blazo X 35',
      model: 'Blazo X 35',
      manufacturer: 'Mahindra',
      manufacture_year: 2023,
      vehicle_type: 'Heavy Truck',
      max_load_capacity: 35000,
      acquisition_cost: 4200000,
      fuel_type: 'Diesel',
      current_odometer: 22100,
      status: 'Available',
      region: 'Tamil Nadu',
      purchase_date: new Date('2023-04-01'),
    },
  ];

  for (const v of vehicles) {
    await prisma.vehicles.upsert({
      where: { registration_number: v.registration_number },
      update: v,
      create: v,
    });
  }

  // 4. Drivers
  const drivers = [
    {
      first_name: 'Suresh',
      last_name: 'Yadav',
      email: 'suresh.yadav@fleetpulse.io',
      phone: '9911223344',
      address: '12, Shivaji Nagar, Pune, Maharashtra 411005',
      date_of_birth: new Date('1985-06-15'),
      emergency_contact: '9911223300',
      license_number: 'MH1420080012345',
      license_category: 'HMV',
      license_issue_date: new Date('2008-03-10'),
      license_expiry_date: new Date('2028-03-09'),
      safety_score: 94.5,
      status: 'Available',
      joining_date: new Date('2018-05-01'),
    },
    {
      first_name: 'Ramesh',
      last_name: 'Gupta',
      email: 'ramesh.gupta@fleetpulse.io',
      phone: '9922334455',
      address: '45, Karol Bagh, New Delhi 110005',
      date_of_birth: new Date('1980-11-20'),
      emergency_contact: '9922334400',
      license_number: 'DL1120050067890',
      license_category: 'HMV',
      license_issue_date: new Date('2005-08-22'),
      license_expiry_date: new Date('2025-08-21'),
      safety_score: 88.0,
      status: 'On Trip',
      joining_date: new Date('2016-02-14'),
    },
    {
      first_name: 'Murugan',
      last_name: 'Krishnan',
      email: 'murugan.krishnan@fleetpulse.io',
      phone: '9933445566',
      address: '78, Anna Nagar, Chennai, Tamil Nadu 600040',
      date_of_birth: new Date('1990-03-08'),
      emergency_contact: '9933445500',
      license_number: 'TN2220120034567',
      license_category: 'HMV',
      license_issue_date: new Date('2012-07-15'),
      license_expiry_date: new Date('2032-07-14'),
      safety_score: 97.0,
      status: 'On Leave',
      joining_date: new Date('2020-09-01'),
    },
    {
      first_name: 'Vijay',
      last_name: 'Patil',
      email: 'vijay.patil@fleetpulse.io',
      phone: '9944556677',
      address: '33, MG Road, Bengaluru, Karnataka 560001',
      date_of_birth: new Date('1978-09-25'),
      emergency_contact: '9944556600',
      license_number: 'KA0520020078901',
      license_category: 'HMV',
      license_issue_date: new Date('2002-04-30'),
      license_expiry_date: new Date('2027-04-29'),
      safety_score: 85.5,
      status: 'Available',
      joining_date: new Date('2015-11-20'),
    },
  ];

  for (const d of drivers) {
    await prisma.drivers.upsert({
      where: { license_number: d.license_number },
      update: d,
      create: d,
    });
  }

  // 5. Routes
  const routesData = [
    { route_name: 'Mumbai–Pune Express',        source: 'Mumbai',    destination: 'Pune',       distance: 148.5, estimated_hours: 2.5,  status: 'Active' },
    { route_name: 'Delhi–Jaipur Highway',       source: 'Delhi',     destination: 'Jaipur',     distance: 281.0, estimated_hours: 5.0,  status: 'Active' },
    { route_name: 'Bengaluru–Chennai Corridor', source: 'Bengaluru', destination: 'Chennai',    distance: 346.0, estimated_hours: 6.0,  status: 'Active' },
    { route_name: 'Ahmedabad–Surat Industrial', source: 'Ahmedabad', destination: 'Surat',      distance: 265.0, estimated_hours: 4.5,  status: 'Active' },
    { route_name: 'Hyderabad–Vijayawada',       source: 'Hyderabad', destination: 'Vijayawada', distance: 275.0, estimated_hours: 4.75, status: 'Active' },
    { route_name: 'Kolkata–Patna NH30',         source: 'Kolkata',   destination: 'Patna',      distance: 590.0, estimated_hours: 10.0, status: 'Active' },
  ];

  for (const r of routesData) {
    const existing = await prisma.routes.findFirst({ where: { route_name: r.route_name } });
    if (!existing) {
      await prisma.routes.create({ data: r });
    }
  }

  // We need actual DB objects for foreign keys
  const dbVehicles = await prisma.vehicles.findMany();
  const dbDrivers  = await prisma.drivers.findMany();
  const dbRoutes   = await prisma.routes.findMany();
  const dbUsers    = await prisma.users.findMany();

  const adminUser = dbUsers.find(u => u.role_id === 1);

  // 6. Trips (random data for analytics)
  if (dbVehicles.length > 0 && dbDrivers.length > 0 && dbRoutes.length > 0 && adminUser) {
    const existingTrips = await prisma.trips.count();

    if (existingTrips === 0) {
      console.log('Generating trips for analytics...');
      const statuses  = ['Completed', 'Completed', 'Completed', 'In Progress', 'Dispatched', 'Cancelled'];
      const cargoTypes = ['Textile Goods', 'Electronic Components', 'Auto Parts', 'Pharmaceutical Goods', 'Cement Bags', 'Steel Coils', 'Agricultural Produce', 'FMCG Products'];
      const pastDates = [1, 2, 5, 10, 15, 20, 25, 30, 45, 60].map(days => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d;
      });

      for (let i = 1; i <= 20; i++) {
        const vehicle  = dbVehicles[i % dbVehicles.length];
        const driver   = dbDrivers[i % dbDrivers.length];
        const route    = dbRoutes[i % dbRoutes.length];
        const status   = statuses[i % statuses.length];
        const pastDate = pastDates[i % pastDates.length];

        await prisma.trips.create({
          data: {
            trip_number:      `TRP-2024-${String(i).padStart(3, '0')}`,
            vehicle_id:       vehicle.id,
            driver_id:        driver.id,
            route_id:         route.id,
            created_by:       adminUser.id,
            source:           route.source,
            destination:      route.destination,
            cargo_type:       cargoTypes[i % cargoTypes.length],
            cargo_weight:     5000 + (i * 800),
            planned_distance: route.distance,
            actual_distance:  status === 'Completed' ? Number(route.distance) + (i * 3) : null,
            planned_start:    pastDate,
            actual_start:     status !== 'Scheduled' ? pastDate : null,
            actual_end:       status === 'Completed' ? new Date(pastDate.getTime() + (Number(route.estimated_hours) * 3600000)) : null,
            fuel_consumed:    status === 'Completed' ? 60 + (i * 3) : null,
            start_odometer:   vehicle.current_odometer! - 2000 + (i * 100),
            end_odometer:     status === 'Completed' ? vehicle.current_odometer! - 2000 + (i * 100) + Number(route.distance) : null,
            revenue:          status === 'Completed' ? 15000 + (i * 2000) : null,
            status:           status,
            created_at:       pastDate,
          },
        });
      }
    }
  }

  // 7. Maintenance Logs
  if (dbVehicles.length > 0 && adminUser) {
    const existingLogs = await prisma.maintenance_logs.count();

    if (existingLogs === 0) {
      console.log('Generating maintenance logs...');
      const statuses      = ['Completed', 'Completed', 'In Progress', 'Scheduled'];
      const maintTypes    = ['Oil Change', 'Brake Replacement', 'Tyre Rotation', 'Engine Tune-up'];
      const serviceCentres = [
        'Tata Motors ASC – Pune',
        'Ashok Leyland Service – Delhi',
        'Apollo Tyres – Mumbai',
        'BharatBenz ASC – Ahmedabad',
      ];

      for (let i = 1; i <= 8; i++) {
        const vehicle = dbVehicles[i % dbVehicles.length];
        const status  = statuses[i % statuses.length];
        const date    = new Date();
        date.setDate(date.getDate() - (i * 3));

        await prisma.maintenance_logs.create({
          data: {
            vehicle_id:       vehicle.id,
            created_by:       adminUser.id,
            maintenance_type: maintTypes[i % maintTypes.length],
            service_center:   serviceCentres[i % serviceCentres.length],
            maintenance_date: date,
            completion_date:  status === 'Completed' ? new Date(date.getTime() + 86400000 * 2) : null,
            cost:             8000 + (i * 3000),
            status:           status,
            created_at:       date,
          },
        });
      }
    }
  }

  console.log('✅ Database seeding completed!');
  console.log('\n🔑 Login credentials (password: password123)');
  console.log('   admin@fleetpulse.io   → Rajesh Sharma  (Admin)');
  console.log('   manager@fleetpulse.io → Priya Mehta    (Fleet Manager)');
  console.log('   driver@fleetpulse.io  → Arjun Nair     (Driver)');
  console.log('   analyst@fleetpulse.io → Kavitha Reddy  (Finance Analyst)');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
