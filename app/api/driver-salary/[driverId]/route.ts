import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/middleware/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { driverId: string } }) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
            return NextResponse.json({ success: false, message: 'Admin or Manager access required' }, { status: 403 });
        }

        const entries = await prisma.driverSalaryLedger.findMany({
            where: { driverId: params.driverId },
            orderBy: { date: 'desc' },
        });

        // Calculate totals
        // Salary/Bonus/Penalty increases debt to driver? Or how does it work?
        // "Auto-sum: Total salary entries, Total payments, Balance"
        // Usually: 
        // Credit (Payable to driver): salary_entry, bonus
        // Debit (Paid to driver/Deducted): payment, advance, penalty

        // Let's assume:
        // Payable = salary_entry + bonus
        // Paid = payment + advance + penalty (penalty reduces payable or acts as deduction?)
        // Actually penalty is usually a deduction from salary. So it increases what driver owes or reduces what company owes.
        // Let's stick to simple:
        // Total Earnings = salary_entry + bonus
        // Total Deductions/Payments = payment + advance + penalty
        // Balance = Earnings - Deductions

        let totalEarnings = 0;
        let totalDeductions = 0;

        entries.forEach(entry => {
            if (['salary_entry', 'bonus'].includes(entry.type)) {
                totalEarnings += entry.amount;
            } else {
                totalDeductions += entry.amount;
            }
        });

        const balance = totalEarnings - totalDeductions;

        return NextResponse.json({
            success: true,
            entries,
            summary: {
                totalEarnings,
                totalDeductions,
                balance
            }
        });
    } catch (error) {
        console.error("Error fetching ledger:", error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
