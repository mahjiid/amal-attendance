"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const workingHoursData = [
  { day: 'Mon', hours: 8.5 },
  { day: 'Tue', hours: 9.0 },
  { day: 'Wed', hours: 8.2 },
  { day: 'Thu', hours: 9.5 },
  { day: 'Fri', hours: 7.8 }, // Short Friday
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 },
];

const punctualityData = [
  { month: 'Jan', score: 95 },
  { month: 'Feb', score: 98 },
  { month: 'Mar', score: 92 },
  { month: 'Apr', score: 99 },
];

export function AnalyticsDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <Card className="glass border-primary/10">
         <CardHeader>
           <CardTitle>Productivity Trends</CardTitle>
           <CardDescription>Weekly working hours analysis.</CardDescription>
         </CardHeader>
         <CardContent className="h-[250px]">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={workingHoursData}>
               <defs>
                 <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
               <XAxis dataKey="day" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
               <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
               <Tooltip 
                 contentStyle={{ backgroundColor: 'rgba(9,9,11,0.9)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                 itemStyle={{ color: '#fff' }}
               />
               <Area type="monotone" dataKey="hours" stroke="#f97316" fillOpacity={1} fill="url(#colorHours)" />
             </AreaChart>
           </ResponsiveContainer>
         </CardContent>
       </Card>

       <Card className="glass border-secondary/10">
         <CardHeader>
           <CardTitle>Punctuality Score</CardTitle>
           <CardDescription>Monthly improved rating.</CardDescription>
         </CardHeader>
         <CardContent className="h-[250px]">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={punctualityData}>
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
               <XAxis dataKey="month" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
               <Tooltip
                 cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                 contentStyle={{ backgroundColor: 'rgba(9,9,11,0.9)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                 itemStyle={{ color: '#fff' }}
               />
               <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
             </BarChart>
           </ResponsiveContainer>
         </CardContent>
       </Card>
    </div>
  );
}
