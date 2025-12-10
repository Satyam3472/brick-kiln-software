
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@brickiln.com';
const ADMIN_PASSWORD = 'Admin@123';

async function verifySaleModule() {
    console.log('🚀 Starting Verification Script...');

    // 0. Pre-check DB
    console.log('\n🔍 Checking Database...');
    let admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

    if (!admin) {
        console.log('⚠️ Admin user not found in DB. Seeding...');
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        admin = await prisma.user.create({
            data: {
                name: 'Super Admin',
                email: ADMIN_EMAIL,
                phone: '+919999999999',
                password: hashedPassword,
                role: 'ADMIN',
                status: 'ACTIVE',
            }
        });
        console.log('✅ Admin user seeded.');
    } else {
        console.log('✅ Admin user exists in DB.');
    }

    // 1. Login
    console.log('\n🔐 Authenticating as Admin...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    if (!loginRes.ok) {
        const text = await loginRes.text();
        throw new Error(`Login failed: ${loginRes.status} ${text}`);
    }
    const loginData = await loginRes.json();
    const cookie = loginRes.headers.get('set-cookie');
    console.log('✅ Logged in successfully.');

    const headers = {
        'Content-Type': 'application/json',
        'Cookie': cookie || ''
    };

    // 2. Create Customer
    console.log('\n👤 Creating Customer...');
    const custRes = await fetch(`${BASE_URL}/api/customers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Test Customer', address: '123 Test St', phone: '1234567890' })
    });
    const custData = await custRes.json();
    if (!custData.success) throw new Error(`Create Customer failed: ${JSON.stringify(custData)}`);
    const customerId = custData.customer.id;
    console.log(`✅ Customer Created: ${customerId}`);

    // 3. Create Driver
    console.log('\n🚚 Creating Driver...');
    const drivRes = await fetch(`${BASE_URL}/api/drivers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Test Driver', vehicleNumber: 'TEST-01', monthlySalary: 15000 })
    });
    const drivData = await drivRes.json();
    if (!drivData.success) throw new Error(`Create Driver failed: ${JSON.stringify(drivData)}`);
    const driverId = drivData.driver.id;
    console.log(`✅ Driver Created: ${driverId}`);

    // 4. Create Brick Type
    console.log('\n🧱 Creating Brick Type...');
    const brickRes = await fetch(`${BASE_URL}/api/brick-types`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Test Brick', rateDefault: 12.5 })
    });
    const brickData = await brickRes.json();
    if (!brickData.success) throw new Error(`Create Brick Type failed: ${JSON.stringify(brickData)}`);
    const brickTypeId = brickData.brickType.id;
    console.log(`✅ Brick Type Created: ${brickTypeId}`);

    // 5. Create Sale
    console.log('\n💰 Creating Sale...');
    const saleRes = await fetch(`${BASE_URL}/api/sales`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            date: new Date().toISOString(),
            customerId,
            driverId,
            brickTypeId,
            chalanNo: 'CH-001',
            quantity: 1000,
            rate: 12.5,
            paid: 5000
        })
    });
    const saleData = await saleRes.json();
    if (!saleData.success) throw new Error(`Create Sale failed: ${JSON.stringify(saleData)}`);
    const saleId = saleData.sale.id;

    // Verify calculations
    if (saleData.sale.amount !== 12500) console.error(`❌ Unexpected Amount: ${saleData.sale.amount} (Expected 12500)`);
    else console.log('✅ Amount calculated correctly (12500)');

    if (saleData.sale.balance !== 7500) console.error(`❌ Unexpected Balance: ${saleData.sale.balance} (Expected 7500)`);
    else console.log('✅ Balance calculated correctly (7500)');

    // 6. Test Driver Ledger
    console.log('\n📒 Adding Driver Ledger Entry...');
    const ledgerRes = await fetch(`${BASE_URL}/api/driver-salary`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            driverId,
            date: new Date().toISOString(),
            type: 'advance',
            amount: 2000,
            note: 'Test Advance'
        })
    });
    const ledgerData = await ledgerRes.json();
    if (!ledgerData.success) throw new Error(`Create Ledger Entry failed: ${JSON.stringify(ledgerData)}`);
    console.log('✅ Ledger Entry Added');

    // 7. Verify Ledger Totals
    console.log('\n🧮 Verifying Ledger Totals...');
    const summaryRes = await fetch(`${BASE_URL}/api/driver-salary/${driverId}`, { headers });
    const summaryData = await summaryRes.json();
    if (summaryData.summary.totalDeductions !== 2000) console.error(`❌ Unexpected Deduction Total: ${summaryData.summary.totalDeductions}`);
    else console.log('✅ Ledger Totals Correct');

    console.log('\n✨ Verification Completed Successfully!');
    await prisma.$disconnect();
}

verifySaleModule().catch(async (err) => {
    console.error('❌ Verification Failed:', err);
    await prisma.$disconnect();
    process.exit(1);
});
