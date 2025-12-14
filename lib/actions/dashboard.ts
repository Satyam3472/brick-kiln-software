"use server";

import prisma from "@/lib/prisma";
import { startOfWeek, endOfWeek, subDays, format } from "date-fns";

export interface DashboardStats {
    totalRevenue: number;
    activeUsers: number;
    totalBricksSold: number;
    unpaidSalesCount: number;
    recentSales: any[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
    // 1. Total Revenue (Sum of all sales amount)
    const revenueResult = await prisma.sale.aggregate({
        _sum: {
            amount: true,
        },
    });
    const totalRevenue = revenueResult._sum.amount || 0;

    // 2. Active Users
    const activeUsers = await prisma.user.count({
        where: {
            status: "ACTIVE",
        },
    });

    // 3. Total Bricks Sold (Sum of quantity)
    // Note: This mixes units (Bricks vs Tractors), but provides a rough activity metric.
    const bricksResult = await prisma.sale.aggregate({
        _sum: {
            quantity: true,
        },
    });
    const totalBricksSold = bricksResult._sum.quantity || 0;

    // 4. Unpaid Sales (Where balance > 0)
    const unpaidSalesCount = await prisma.sale.count({
        where: {
            balance: {
                gt: 0,
            },
        },
    });

    // 5. Recent Sales (Last 5)
    const recentSales = await prisma.sale.findMany({
        take: 5,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            customer: true,
            brickType: true,
        },
    });

    return {
        totalRevenue,
        activeUsers,
        totalBricksSold,
        unpaidSalesCount,
        recentSales,
    };
}

export interface ChartData {
    name: string;
    total: number;
}

export async function getSalesChartData(): Promise<ChartData[]> {
    // Get sales for the last 7 days
    const endDate = new Date();
    const startDate = subDays(endDate, 6);

    const sales = await prisma.sale.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            date: true,
            amount: true,
        },
    });

    // Group by day
    const groupedData: Record<string, number> = {};

    // Initialize last 7 days with 0
    for (let i = 0; i < 7; i++) {
        const date = subDays(endDate, i);
        const dayName = format(date, "EEE"); // Mon, Tue, etc.
        groupedData[dayName] = 0;
    }

    // Aggregate
    sales.forEach((sale: { date: Date; amount: number }) => {
        const dayName = format(sale.date, "EEE");
        if (groupedData[dayName] !== undefined) {
            groupedData[dayName] += sale.amount;
        }
    });

    // Convert to array and reverse to show chronological order (Mon -> Sun)
    // Actually need to sort by date. 
    // Let's rely on the predefined 7 days list order
    const result = [];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(endDate, i);
        const dayName = format(date, "EEE");
        result.push({
            name: dayName,
            total: groupedData[dayName] || 0
        });
    }

    return result;
}
