# فريق لوحة الأدمن — React + Vite (HighLit)

هذا الدليل لفريق الواجهة: **مصطفى، فهمي**. الهدب بناء **لوحة تحكم إدارية** منفصلة عن موقع Next.js الحالي (`frontend/`) باستخدام **Vite + React + TypeScript**.

---

## 1. لماذا Vite وليس مجلد داخل Next؟

تم اختيار تطبيق **منفصل** لتفادي خلط مسارات الأدمن مع الموقع العام، ولفصل التبعيات والـ build. يمكن لاحقاً **توحيد التصميم** (Tailwind، ألوان) مع نسخ متغيرات أو مكوّنات بسيطة يدوياً.

---

## 2. إنشاء المشروع

```powershell
cd c:\Users\qa3dn\Desktop\HighLit
npm create vite@latest admin-dashboard -- --template react-ts
cd admin-dashboard
npm install
npm install axios @tanstack/react-query react-router-dom
# اختياري: tailwindcss postcss autoprefixer
```

- **اسم المجلد المقترح:** `admin-dashboard` (أو `admin` — يُوثَّق في [PROJECT_RUNBOOK.md](PROJECT_RUNBOOK.md)).

---

## 3. متغيرات البيئة

أنشئ ملف `.env` في جذر مشروع Vite (لا ترفع القيم السرية إلى Git):

```env
VITE_API_URL=http://localhost:8000/api/v1
```

- في الكود استخدم `import.meta.env.VITE_API_URL` فقط.
- عندما يكون الباكند لا يزال Nest على 3001، يمكن مؤقتاً:

```env
VITE_API_URL=http://localhost:3001
```

**ملاحظة:** بادئة `VITE_` مطلوبة في Vite لإتاحة المتغير للـ client.

---

## 4. هيكل مجلدات مقترح

```
src/
  api/
    client.ts          # axios instance + interceptors للـ Bearer token
    auth.ts            # login, refresh, logout
    projects.ts        # قائمة مشاريع، فلترة، حالات
    companies.ts
  components/
    layout/            # Sidebar, Header
    ui/                # جداول، أزرار، نماذج
  features/
    auth/
    projects/
    companies/
  hooks/
  routes/
  main.tsx
```

---

## 5. عميل HTTP (Axios)

- **Base URL:** من `VITE_API_URL`.
- **Authorization:** `Bearer <access_token>` بعد تسجيل الدخول.
- **معالجة 401:** إعادة توجيه لصفحة `/login` أو محاولة refresh إن وفرها الباكند (اتفقوا مع فريق Django على الشكل في [API_CONTRACT.md](API_CONTRACT.md).
- **تخزين التوكن:** الأفضل **memory** + refresh cookie إن أمكن الباكند؛ تجنّب `localStorage` للحساسات إن أمكن — أو كحد أدنى لا تخزّن إلا الـ access مع قصر العمر.

---

## 6. صفحات مقترحة للمشروع

| الصفحة | الغرض |
|--------|--------|
| `/login` | تسجيل دخول أدمن، استلام JWT |
| `/projects` | جدول مشاريع الطلاب مع **فلترة** (تخصص، سنة، حالة اعتماد، بحث نصي) |
| `/projects/:id` | تفاصيل، اعتماد/رفض، ملاحظات |
| `/companies` | قائمة الشركات، تعديل/تفعيل |
| `/dashboard` | إحصائيات بسيطة (مشروعات معلّقة، جديدة هذا الأسبوع) |

استخدم **React Router** للمسارات و **TanStack Query** للجلب والتحديث والـ cache.

---

## 7. الربط مع الـ API

- راجع [API_CONTRACT.md](API_CONTRACT.md) لـ المسارات والأجسام.
- أي حقل جديد يظهر في الـ UI يجب أن يكون **موثّقاً** في العقد قبل الاعتماد.

---

## 8. CORS

يجب أن يضيف فريق Django **أصل** Vite:

`http://localhost:5173`

(المنفذ الافتراضي لـ `npm run dev` في Vite.)

---

## 9. تشغيل التطوير

```powershell
cd c:\Users\qa3dn\Desktop\HighLit\admin-dashboard
npm run dev
```

يفتح عادة `http://localhost:5173`.

---

## 10. البناء للإنتاج

```powershell
npm run build
npm run preview
```

الرفع لاحقاً على استضافة ثابتة أو خلف nginx — يُنسَّق مع الليدر.

---

## مراجع

| الموضوع | الملف |
|---------|--------|
| عقد API | [API_CONTRACT.md](API_CONTRACT.md) |
| المنافذ والتشغيل | [PROJECT_RUNBOOK.md](PROJECT_RUNBOOK.md) |
| Git | [GIT_WORKFLOW.md](GIT_WORKFLOW.md) |
