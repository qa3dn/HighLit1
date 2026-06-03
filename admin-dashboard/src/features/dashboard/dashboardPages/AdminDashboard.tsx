import React from 'react';
import {
    Users,
    Building2,
    Briefcase,
    FileText,
    Star,
    Clock,
    TrendingUp,
    TrendingDown,
    type LucideIcon
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

const iconMap: Record<'Users' | 'Building2' | 'Briefcase' | 'FileText', LucideIcon> = {
    Users: Users,
    Building2: Building2,
    Briefcase: Briefcase,
    FileText: FileText,
};

const AdminDashboard: React.FC = () => {
    const { stats, chartData, recentReviews, recentActivities } = useAdminDashboard();

    // Function to render stars dynamically
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(
                    <Star key={i} className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                );
            } else {
                stars.push(
                    <Star key={i} className="w-4 h-4 text-slate-700 fill-transparent" />
                );
            }
        }
        return stars;
    };
    return (
        <div dir="rtl" className="w-full min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 select-none font-sans relative overflow-hidden">
            {/* Decorative Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

            {/* Top Section / Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping"></span>
                        لوحة التحكم للمسؤول
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">مرحباً بك مجدداً! إليك نظرة شاملة على أداء المنصة اليوم.</p>
                </div>
                {/* Date badge */}
                <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-300 w-fit">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>تحديث مباشر</span>
                </div>
            </div>

            {/* Top Section: 4-column grid for stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
                    const IconComponent = iconMap[stat.iconName];
                    return (
                        <div
                            key={stat.id}
                            className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] group"
                        >
                            {/* Card Radial Hover Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex justify-between items-start relative z-10">
                                <span className="text-slate-400 text-sm font-semibold">{stat.title}</span>
                                <span className="p-3 rounded-xl bg-slate-800/60 text-emerald-400 border border-slate-700/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all duration-300">
                                    <IconComponent className="w-5 h-5" />
                                </span>
                            </div>

                            <div className="mt-4 relative z-10">
                                <span className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</span>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${stat.isPositive
                                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                        : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                                        }`}>
                                        {stat.isPositive ? (
                                            <TrendingUp className="w-3.5 h-3.5" />
                                        ) : (
                                            <TrendingDown className="w-3.5 h-3.5" />
                                        )}
                                        <span dir="ltr">{stat.change}</span>
                                    </span>
                                    <span className="text-xs text-slate-500">مقارنة بالشهر الماضي</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Middle Section: Platform Growth Chart */}
            <div dir="ltr" className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 mb-8 relative overflow-hidden">                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">معدل نمو المنصة</h2>
                    <p className="text-slate-400 text-xs mt-1">تطور أعداد المستخدمين والشركات خلال الـ 6 أشهر الماضية</p>
                </div>
                {/* Chart Legend Indicators */}
                <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-300">المستخدمين</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-cyan-500" />
                        <span className="text-slate-300">الشركات</span>
                    </span>
                </div>
            </div>

                {/* Responsive Recharts Container wrapped in forced LTR container to prevent collapsing */}
                <div style={{ width: '100%', height: 350 }} dir="ltr">
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>

                                <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

                            <XAxis
                                dataKey="month"
                                stroke="#64748b"
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                stroke="#64748b"
                                tickLine={false}
                                axisLine={false}
                            />

                            <Tooltip />

                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#22c55e"
                                fill="url(#colorUsers)"
                            />

                            <Area
                                type="monotone"
                                dataKey="companies"
                                stroke="#06b6d4"
                                fill="url(#colorCompanies)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            {/* Bottom Section: 2-column grid for Recent Reviews and Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Column 1: Recent Reviews */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Star className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                            أحدث التقييمات
                        </h2>
                        <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700/50">آخر التحديثات</span>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                        {recentReviews.map((review) => (
                            <div
                                key={review.id}
                                className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 transition-colors hover:border-slate-700/50"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-3">
                                        {/* Initials Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{review.name}</h4>
                                            <p className="text-xs text-slate-400 mt-0.5">{review.role}</p>
                                        </div>
                                    </div>
                                    {/* Stars Container */}
                                    <div className="flex items-center gap-0.5">
                                        {renderStars(review.rating)}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-300 mt-3 leading-relaxed bg-slate-950/20 p-2.5 rounded-lg border border-slate-800/30 italic">
                                    "{review.comment}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2: Recent Activities */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-emerald-400" />
                            النشاطات الأخيرة
                        </h2>
                        <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700/50">بث مباشر</span>
                    </div>

                    <div className="flex flex-col gap-6 mt-4 pr-3 relative before:absolute before:right-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex gap-4 relative z-10">
                                {/* Timeline bullet dot */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 transition-transform duration-300 hover:scale-110 ${activity.type === 'user'
                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                    : activity.type === 'company'
                                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                        : activity.type === 'job'
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                    }`}>
                                    <Clock className="w-4 h-4" />
                                </div>

                                <div className="flex flex-col justify-center">
                                    <p className="text-xs font-semibold text-slate-200 leading-normal">{activity.event}</p>
                                    <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                                        <Clock className="w-3 h-3 text-slate-600" />
                                        {activity.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
