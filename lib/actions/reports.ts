"use server";

import prisma from "@/lib/prisma";

export interface CustomerPendingReport {
    customerId: string;
    customerName: string;
    customerPhone: string | null;
    totalPending: number;
    sales: {
        id: string; // Sale ID
        date: Date;
        chalanNo: string;
        brickType: string;
        quantity: number;
        rate: number;
        amount: number;
        paid: number;
        balance: number;
    }[];
}

export async function getCustomerPendingReports(): Promise<CustomerPendingReport[]> {
    // 1. Fetch sales where balance > 0, include Customer and BrickType details
    const unpaidSales = await prisma.sale.findMany({
        where: {
            balance: {
                gt: 0,
            },
        },
        include: {
            customer: true,
            brickType: true,
        },
        orderBy: {
            customer: {
                name: 'asc',
            },
        },
    });

    // 2. Group by Customer
    const reportMap = new Map<string, CustomerPendingReport>();

    for (const sale of unpaidSales) {
        if (!reportMap.has(sale.customerId)) {
            reportMap.set(sale.customerId, {
                customerId: sale.customerId,
                customerName: sale.customer.name,
                customerPhone: sale.customer.phone,
                totalPending: 0,
                sales: [],
            });
        }

        const report = reportMap.get(sale.customerId)!;
        report.totalPending += sale.balance;
        report.sales.push({
            id: sale.id,
            date: sale.date,
            chalanNo: sale.chalanNo,
            brickType: sale.brickType.name,
            quantity: sale.quantity,
            rate: sale.rate,
            amount: sale.amount,
            paid: sale.paid,
            balance: sale.balance,
        });
    }

    // 3. Convert Map to Array
    return Array.from(reportMap.values());
}
