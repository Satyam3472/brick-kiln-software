'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const data = [
    { name: 'Mon', total: 1200 },
    { name: 'Tue', total: 2100 },
    { name: 'Wed', total: 1800 },
    { name: 'Thu', total: 2400 },
    { name: 'Fri', total: 1600 },
    { name: 'Sat', total: 3200 },
    { name: 'Sun', total: 3500 },
];

export function SalesOverviewChart() {
    return (
        <Card className="col-span-4 lg:col-span-3 hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                    Daily revenue for the current week
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                                formatter={(value: number) => [`₹${value}`, 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#f97316"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
