export interface StatItem {
    id: string;
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    iconName: 'Users' | 'Building2' | 'Briefcase' | 'FileText';
}

export interface ChartDataItem {
    month: string;
    users: number;
    companies: number;
}

export interface ReviewItem {
    id: string;
    name: string;
    role: string;
    rating: number;
    comment: string;
}

export interface ActivityItem {
    id: string;
    event: string;
    time: string;
    type: 'user' | 'company' | 'job' | 'system';
}

export interface AdminDashboardData {
    stats: StatItem[];
    chartData: ChartDataItem[];
    recentReviews: ReviewItem[];
    recentActivities: ActivityItem[];
}

export const useAdminDashboard = (): AdminDashboardData => {
    const stats: StatItem[] = [
        {
            id: 'users',
            title: 'إجمالي المستخدمين',
            value: '١٢,٤٥٠',
            change: '+١٢.٥%',
            isPositive: true,
            iconName: 'Users',
        },
        {
            id: 'companies',
            title: 'الشركات المسجلة',
            value: '١,٢٨٠',
            change: '+٨.٢%',
            isPositive: true,
            iconName: 'Building2',
        },
        {
            id: 'jobs',
            title: 'الوظائف النشطة',
            value: '٣,٤٢٠',
            change: '+٢٤.٣%',
            isPositive: true,
            iconName: 'Briefcase',
        },
        {
            id: 'applications',
            title: 'الطلبات الجديدة',
            value: '٨٥٠',
            change: '-٤.١%',
            isPositive: false,
            iconName: 'FileText',
        },
    ];

    const chartData: ChartDataItem[] = [
        { month: 'يناير', users: 4000, companies: 240 },
        { month: 'فبراير', users: 5000, companies: 398 },
        { month: 'مارس', users: 6500, companies: 580 },
        { month: 'أبريل', users: 8200, companies: 790 },
        { month: 'مايو', users: 10100, companies: 980 },
        { month: 'يونيو', users: 12450, companies: 1280 },
    ];

    const recentReviews: ReviewItem[] = [
        {
            id: 'rev-1',
            name: 'أحمد العتيبي',
            role: 'مطور واجهات أول',
            rating: 5,
            comment: 'منصة رائعة جداً وسهلت عليّ إيجاد وظيفة تناسب مؤهلاتي في وقت قياسي وبأقل جهد.',
        },
        {
            id: 'rev-2',
            name: 'نورة الشمري',
            role: 'مديرة الموارد البشرية - شركة حلول التقنية',
            rating: 4,
            comment: 'تجربة استخدام ممتازة للوصول إلى الكوادر البرمجية المؤهلة بالمملكة بكل سهولة.',
        },
        {
            id: 'rev-3',
            name: 'عبد الله الدوسري',
            role: 'مهندس سحابة حاسوبية',
            rating: 5,
            comment: 'واجهة مستخدم احترافية وتجربة مستخدم سلسة للغاية. أنصح بها جميع الباحثين عن عمل.',
        },
    ];

    const recentActivities: ActivityItem[] = [
        {
            id: 'act-1',
            event: 'سجل مستخدم جديد (فيصل الحربي) في المنصة كباحث عن عمل',
            time: 'منذ ٣ دقائق',
            type: 'user',
        },
        {
            id: 'act-2',
            event: 'نشرت شركة (العلم للحلول الرقمية) عرض عمل جديد لمطور بايثون',
            time: 'منذ ١٥ دقيقة',
            type: 'job',
        },
        {
            id: 'act-3',
            event: 'تم تفعيل حساب شركة (سدايا للذكاء الاصطناعي) كشريك فضي',
            time: 'منذ ٣٢ دقيقة',
            type: 'company',
        },
    ];

    return {
        stats,
        chartData,
        recentReviews,
        recentActivities,
    };
};
