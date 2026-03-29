# HighLit

منصة مجتمعية للمطورين — **مشروع تخرّج**. التطوير الحالي يعتمد على **NestJS** و**Next.js**، مع خطة لتوسيع المنصة: **نشر مشاريع طلابية**، **بوابة للشركات**، **نظام فلترة**، و**لوحة إدارية** (Django REST + React/Vite).

**HighLit** — A developer community platform (graduation project). Current stack: NestJS API + Next.js; planned: student projects showcase, company portal, filtering, and admin dashboard.

---

## الفريق

| الاسم | التركيز المقترح |
|--------|------------------|
| محمد قعدان | ليدر المشروع، باكند (Django) |
| أحمد الحمد | باكند (Django) |
| أحمد محسن | باكند (Django) |
| مصطفى | لوحة الأدمن (React / Vite) |
| فهمي | لوحة الأدمن (React / Vite) |
| أمجد الزعبي | يُحدَّد دوره مع الفريق (مثلاً الواجهة العامة أو الجودة) |

---

## التقنيات (حاليًا)

| الطبقة | التقنية |
|--------|---------|
| API | [NestJS](https://nestjs.com/)، TypeORM، PostgreSQL |
| الواجهة العامة | [Next.js 14](https://nextjs.org/)، React، Tailwind CSS |
| التوثيق التفاعلي للـ API | Swagger — `http://localhost:3001/api/docs` بعد تشغيل الباكند |

**مخطط:** باكند [Django REST Framework](https://www.django-rest-framework.org/)، لوحة أدمن منفصلة بـ [Vite](https://vitejs.dev/) + React — راجع مجلد `docs/`.

---

## هيكل المستودع

```
HighLit/
├── backend/          # NestJS API (المنفذ الافتراضي 3001)
├── frontend/         # Next.js (المنفذ الافتراضي 3000)
├── docs/             # أدلة التشغيل، عقد API، خطط الفرق
├── .gitignore
└── README.md
```

مجلدات مثل `backend-django/` و`admin-dashboard/` تُضاف لاحقًا عند تنفيذ خطة التوسّع (موثّقة في `docs/`).

---

## البدء السريع

**المتطلبات:** Node.js 18+، npm، PostgreSQL.

1. أنشئ قاعدة بيانات باسم `highlit` (راجع `backend/START_HERE.md`).
2. انسخ إعدادات البيئة في `backend/.env` (قالب في `backend/START_HERE.md`).
3. شغّل الباكند ثم الفرونت:

```powershell
cd backend
npm install
npm run start:dev
```

في نافذة طرفية أخرى:

```powershell
cd frontend
npm install
npm run dev
```

- الموقع: [http://localhost:3000](http://localhost:3000)  
- الـ API: [http://localhost:3001](http://localhost:3001)  
- فحص صحة المصادقة: [http://localhost:3001/auth/health](http://localhost:3001/auth/health)

تفاصيل المنافذ، Django، وVite: **[docs/PROJECT_RUNBOOK.md](docs/PROJECT_RUNBOOK.md)**.

---

## الوثائق

| الملف | المحتوى |
|--------|---------|
| [docs/PROJECT_RUNBOOK.md](docs/PROJECT_RUNBOOK.md) | تشغيل المشروع، PostgreSQL، المنافذ |
| [docs/API_CONTRACT.md](docs/API_CONTRACT.md) | مسارات الـ API والاتفاقات بين الفرق |
| [docs/TEAM_BACKEND_DJANGO.md](docs/TEAM_BACKEND_DJANGO.md) | دليل فريق الباكند (Django) |
| [docs/TEAM_FRONTEND_ADMIN_VITE.md](docs/TEAM_FRONTEND_ADMIN_VITE.md) | دليل لوحة الأدمن (React + Vite) |
| [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) | فروع Git وطريقة العمل الجماعي |

---

## الرخصة

يُحدَّد لاحقًا حسب سياسة الجامعة أو الفريق.
