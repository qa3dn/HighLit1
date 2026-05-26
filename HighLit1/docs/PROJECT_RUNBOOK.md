# دليل تشغيل المشروع — HighLit

لجميع أعضاء الفريق: **تشغيل قاعدة البيانات، المنافذ، والأوامر** لكل جزء من المشروع.

---

## 1. قرار الليدر (يُحدَّث هنا)

| البند | الحالة المقترحة |
|--------|------------------|
| API الإنتاجي | **Django** في `backend/` |
| NestJS | تمت إزالته ضمن hard replacement |
| قاعدة البيانات | **PostgreSQL** — قاعدة واحدة `highlit` (لا تعارض migrations بين Nest و Django دون خطة) |

اعتمدوا على Django فقط ضمن هذا المستودع.

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
| Django API | **8000** | `backend/` |
| Vite (لوحة الأدمن) | **5173** | `admin-dashboard/` عند الإنشاء |

---

## 4. الباكند — Django (الحالي)

```powershell
cd c:\Users\qa3dn\Desktop\HighLit\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

- **Swagger:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **صحة:** [http://localhost:8000/api/v1/auth/health](http://localhost:8000/api/v1/auth/health)

---

## 5. WebSocket (Channels)

```powershell
Path: `ws://localhost:8000/ws/spaces/lobby/`
```

- تأكيد `CORS` للأصول: `http://localhost:3000`، `http://localhost:5173`.

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
