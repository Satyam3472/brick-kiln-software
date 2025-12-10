import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Hash the default admin password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create Super Admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@brickiln.com' },
        update: {},
        create: {
            name: 'Super Admin',
            email: 'admin@brickiln.com',
            phone: '+919999999999',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });

    console.log('✅ Super Admin created:', {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
    });

    // Create a sample Manager user
    const managerPassword = await bcrypt.hash('Manager@123', 10);
    const manager = await prisma.user.upsert({
        where: { email: 'manager@brickiln.com' },
        update: {},
        create: {
            name: 'Sample Manager',
            email: 'manager@brickiln.com',
            phone: '+919999999998',
            password: managerPassword,
            role: 'MANAGER',
            status: 'ACTIVE',
        },
    });

    console.log('✅ Sample Manager created:', {
        id: manager.id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
    });

    // Create a sample Staff user
    const staffPassword = await bcrypt.hash('Staff@123', 10);
    const staff = await prisma.user.upsert({
        where: { email: 'staff@brickiln.com' },
        update: {},
        create: {
            name: 'Sample Staff',
            email: 'staff@brickiln.com',
            phone: '+919999999997',
            password: staffPassword,
            role: 'STAFF',
            status: 'ACTIVE',
        },
    });

    console.log('✅ Sample Staff created:', {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
    });

    // Seed Brick Types
    const brickTypes = [
        { name: 'First Class', description: 'Top quality bricks', rateDefault: 12.0, unit: 'BRICK' },
        { name: 'Second Class', description: 'Medium quality', rateDefault: 10.5, unit: 'BRICK' },
        { name: 'Third Class', description: 'Lower quality', rateDefault: 8.0, unit: 'BRICK' },
        { name: 'Tukda', description: 'Broken pieces', rateDefault: 3000.0, unit: 'TRACTOR' },
        { name: 'Kuchha', description: 'Unbaked', rateDefault: 2500.0, unit: 'TRACTOR' },
    ];

    for (const bt of brickTypes) {
        // cast unit to any to avoid TS error before client regen
        await prisma.brickType.create({
            data: bt as any,
        });
    }
    console.log('✅ Brick Types seeded');

    // Seed Customers
    const customers = [
        { name: 'ABC Construction', address: '123 Main St, City', phone: '9876543210' },
        { name: 'XYZ Builders', address: '456 Market Rd, Town', phone: '9876543211' },
    ];

    for (const cust of customers) {
        await prisma.customer.create({
            data: cust,
        });
    }
    console.log('✅ Customers seeded');

    // Seed Drivers
    const drivers = [
        { name: 'Ramesh Kumar', phone: '9000000001', vehicleNumber: 'KA-01-AB-1234' },
        { name: 'Suresh Singh', phone: '9000000002', vehicleNumber: 'KA-02-CD-5678' },
    ];

    for (const driver of drivers) {
        await prisma.driver.create({
            data: driver,
        });
    }
    console.log('✅ Drivers seeded');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Default Login Credentials:');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║ Admin Login:                                   ║');
    console.log('║   Email: admin@brickiln.com                    ║');
    console.log('║   Password: Admin@123                          ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log('║ Manager Login:                                 ║');
    console.log('║   Email: manager@brickiln.com                  ║');
    console.log('║   Password: Manager@123                        ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log('║ Staff Login:                                   ║');
    console.log('║   Email: staff@brickiln.com                    ║');
    console.log('║   Password: Staff@123                          ║');
    console.log('╚════════════════════════════════════════════════╝');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
