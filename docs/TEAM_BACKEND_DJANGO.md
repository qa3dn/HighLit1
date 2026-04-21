# فريق الباكند — Django (HighLit)

هذا الدليل لفريق الباكند: **محمد قعدان، أحمد الحمد، أحمد محسن**. الهدف بناء وصيانة **REST API** بـ **Django + Django REST Framework** في `backend/` كالباكند الأساسي للمشروع.

---

## 1. المتطلبات على الجهاز (Windows)

- **Python 3.11+** ([python.org](https://www.python.org/downloads/)) — تأكد من تفعيل «Add Python to PATH».
- **PostgreSQL 12+** (نفس قاعدة المشروع الحالية عند الاستمرار بـ `highlit`).
- **Git** (للسحب والدفع حسب [GIT_WORKFLOW.md](GIT_WORKFLOW.md)).

تحقق:

```powershell
python --version
pip --version
psql --version
```

---

## 2. إعداد مشروع Django (المجلد الحالي)

```powershell
cd c:\Users\qa3dn\Desktop\HighLit\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install django djangorestframework psycopg2-binary python-dotenv
pip install djangorestframework-simplejwt django-cors-headers
# لاحقاً: drf-spectacular pytest pytest-django
```

---

## 3. الحزم الأساسية المقترحة

| الحزمة | الغرض |
|--------|--------|
| `djangorestframework` | REST API |
| `djangorestframework-simplejwt` | توكنات JWT (مماثلة لفكرة Nest الحالية) |
| `django-cors-headers` | السماح لـ Next (`:3000`) و Vite Admin (`:5173`) |
| `psycopg2-binary` | اتصال PostgreSQL |
| `drf-spectacular` | توثيق OpenAPI/Swagger (بديل لـ `/api/docs` في Nest) |

---

## 4. إعدادات مهمة (`config/settings.py`)

- **`ALLOWED_HOSTS`**: `localhost`, `127.0.0.1` للتطوير.
- **`CORS_ALLOWED_ORIGINS`**: على الأقل:
  - `http://localhost:3000` (Next)
  - `http://localhost:5173` (Vite Admin)
- **`REST_FRAMEWORK`**: مصادقة JWT، صلاحيات حسب الدور (`IsAuthenticated`, `IsAdminUser` للأدمن).
- **`DATABASES`**: نفس فكرة المتغيرات في Nest — اقرأ من `.env`:

```env
DB_NAME=highlit
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=django-secret-change-me
```

---

## 5. هيكل تطبيقات مقترح (`apps/`)

ضمن مشروع Django أنشئ تطبيقات منفصلة لتسهيل الصيانة:

| التطبيق | مسؤولية |
|---------|---------|
| `accounts` | مستخدم، أدوار (طالب / شركة / أدمن)، تسجيل، JWT |
| `projects` | **مشاريع الطلاب**، حالة الاعتماد، وسوم، فلترة |
| `companies` | ملفات الشركات، ربط بالوظائف أو العروض |
| `jobs` | (إن وُجدت) نشر وظائف — يمكن محاذاة سلوك Nest الحالي |
| `moderation` | طابور مراجعة للأدمن (اختياري كطبقة خدمات) |

استخدم **نماذج واضحة** و**فهارس** على الحقول المستخدمة في الفلترة (التخصص، السنة، الحالة، المدينة، إلخ).

---

## 6. تنظيم مسارات API

1. **مصدر الحقيقة للمسارات الحالية:** [API_CONTRACT.md](API_CONTRACT.md) و Swagger على `http://localhost:8000/api/docs`.
2. **الاستراتيجية:** تنفيذ **إصدار API** موحّد تحت `/api/v1/`.
3. **الكيانات المرجعية:** أي تحسينات مستقبلية توثَّق مباشرة في عقد API.

---

## 7. مصادقة الأدمن مقابل المستخدم العادي

- مستخدمو لوحة الأدمن (Vite) يحتاجون **دور staff/superuser** أو مجموعة صلاحيات واضحة.
- لا تعتمد على «سرّ في الفرونت»؛ كل الحماية على السيرفر (صلاحيات DRF + فحص الكائنات).

---

## 8. الاختبارات

```powershell
pip install pytest pytest-django
pytest
```

اكتبوا على الأقل اختبارات للـ endpoints الحرجة: تسجيل، تسجيل دخول، CRUD للمشروع، فلترة.

---

## 9. تشغيل محلي

```powershell
.\.venv\Scripts\Activate.ps1
cd c:\Users\qa3dn\Desktop\HighLit\backend
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

المنفذ **8000** هو المنفذ الافتراضي.

---

## 10. تواصل مع الفرونت

- أي تغيير في شكل JSON أو مسار يُحدَّث فوراً في [API_CONTRACT.md](API_CONTRACT.md).
- بعد إضافة `drf-spectacular`، يمكن نشر رابط `/api/schema/swagger-ui/` (أو ما يعادله) للفريق.

---

## مرجع سريع — فريق الباكند

| المهمة | الملف/المكان |
|--------|----------------|
| عقد API | [API_CONTRACT.md](API_CONTRACT.md) |
| تشغيل المشروع | [PROJECT_RUNBOOK.md](PROJECT_RUNBOOK.md) |
| Git | [GIT_WORKFLOW.md](GIT_WORKFLOW.md) |
