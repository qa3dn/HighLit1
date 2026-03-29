# دليل تشغيل المشروع — HighLit

لجميع أعضاء الفريق: **تشغيل قاعدة البيانات، المنافذ، والأوامر** لكل جزء من المشروع.

---

## 1. قرار الليدر (يُحدَّث هنا)

| البند | الحالة المقترحة |
|--------|------------------|
| API الإنتاجي قريباً | **Django** في مجلد مثل `backend-django/` |
| NestJS في `backend/` | **مرجع / وضع انتقالي** حتى اكتمال Django |
| قاعدة البيانات | **PostgreSQL** — قاعدة واحدة `highlit` (لا تعارض migrations بين Nest و Django دون خطة) |

إذا شغّلتم **Nest و Django** معاً على نفس الـ DB دون تنسيق، قد تتعارض الجداول. نسّقوا عبر الليدر.

---

## 2. المتطلبات المشتركة

- **Node.js 18+** و **npm** (لـ Nest و Next و Vite).
- **PostgreSQL 12+**.
- **Python 3.11+** (لـ Django عند إضافة المشروع).

### إنشاء قاعدة البيانات (مرة واحدة)

```sql
CREATE DATABASE highlit;
```

أو عبر `psql` / pgAdmin. بيانات الاتصال تطابق ملف `.env` في `backend/` (راجع [backend/START_HERE.md](../backend/START_HERE.md)).

---

## 3. جدول المنافذ

| الخدمة | المنفذ الافتراضي | المجلد |
|--------|------------------|--------|
| Next.js (الموقع العام) | **3000** | `frontend/` |
| NestJS (API الحالي) | **3001** | `backend/` |
| Django (مستقبلي) | **8000** (مقترح) | `backend-django/` عند الإنشاء |
| Vite (لوحة الأدمن) | **5173** | `admin-dashboard/` عند الإنشاء |

---

## 4. الباكند — NestJS (الحالي)

```powershell
cd c:\Users\qa3dn\Desktop\HighLit\backend
copy NUL .env
# عدّل .env: DB_*, JWT_SECRET, PORT=3001, FRONTEND_URL=http://localhost:3000
npm install
npm run start:dev
```

- **Swagger:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **صحة:** [http://localhost:3001/auth/health](http://localhost:3001/auth/health)

---

## 5. الباكند — Django (عند الإضافة)

```powershell
cd c:\Users\qa3dn\Desktop\HighLit\backend-django
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

- تأكيد `CORS` للأصول: `http://localhost:3000`، `http://localhost:5173`.
- توثيق OpenAPI عند الجاهزية (راجع [TEAM_BACKEND_DJANGO.md](TEAM_BACKEND_DJANGO.md)).

---

## 6. الفرونت — Next.js

```powershell
cd c:\Users\qa3dn\Desktop\HighLit\frontend
npm install
npm run dev
```

يفتح على [http://localhost:3000](http://localhost:3000).

---

## 7. لوحة الأدمن — Vite (عند الإضافة)

```powershell
cd c:\Users\qa3dn\Desktop\HighLit\admin-dashboard
npm install
# أنشئ .env — راجع TEAM_FRONTEND_ADMIN_VITE.md
npm run dev
```

عادة [http://localhost:5173](http://localhost:5173).

---

## 8. مشاكل شائعة

| المشكلة | الحل |
|---------|------|
| المنفذ مستخدم | غيّر `PORT` في `.env` أو أوقف العملية |
| فشل اتصال PostgreSQL | تحقق من الخدمة، كلمة المرور، واسم القاعدة |
| CORS في المتصفح | أضف أصل الفرونت في Nest أو Django |

---

## 9. روابط الوثائق

- [TEAM_BACKEND_DJANGO.md](TEAM_BACKEND_DJANGO.md)
- [TEAM_FRONTEND_ADMIN_VITE.md](TEAM_FRONTEND_ADMIN_VITE.md)
- [API_CONTRACT.md](API_CONTRACT.md)
- [GIT_WORKFLOW.md](GIT_WORKFLOW.md)
