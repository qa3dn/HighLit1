# 🚀 دليل تشغيل الـ Backend

## المتطلبات الأساسية

1. **Node.js** (v18 أو أحدث)
2. **PostgreSQL** (v12 أو أحدث)
3. **npm** أو **yarn**

## خطوات التشغيل

### 1. تثبيت المتطلبات
```bash
npm install
```

### 2. إعداد قاعدة البيانات

#### أ) تأكد من أن PostgreSQL يعمل
```bash
# على Windows
# افتح Services وابحث عن "postgresql" وتأكد أنه يعمل
```

#### ب) أنشئ قاعدة البيانات
```sql
-- افتح psql أو pgAdmin
CREATE DATABASE highlit;
```

### 3. إنشاء ملف `.env`

أنشئ ملف `.env` في مجلد `backend/` مع المحتوى التالي:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=highlit

# Server
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# JWT Secret (استخدم أي نص عشوائي قوي)
JWT_SECRET=your-super-secret-key-change-this-in-production

# GitHub OAuth (اختياري - للتسجيل عبر GitHub)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**⚠️ مهم:** غيّر `DB_PASSWORD` و `JWT_SECRET` إلى قيم آمنة!

### 4. تشغيل الـ Backend

```bash
npm run start:dev
```

يجب أن ترى:
```
🚀 HighLit API is running on: http://localhost:3001
📚 Swagger docs available at: http://localhost:3001/api/docs
```

### 5. التحقق من التشغيل

افتح المتصفح على:
- Health Check: http://localhost:3001/auth/health
- API Docs: http://localhost:3001/api/docs

## حل المشاكل الشائعة

### ❌ "Database connection failed"
- تأكد من أن PostgreSQL يعمل
- تحقق من بيانات الاتصال في `.env`
- تأكد من أن قاعدة البيانات `highlit` موجودة

### ❌ "Port 3001 is already in use"
- أوقف العملية التي تستخدم port 3001
- أو غيّر `PORT` في `.env` إلى port آخر

### ❌ "Cannot find module"
- شغّل `npm install` مرة أخرى

## ملاحظات

- في وضع التطوير (`NODE_ENV=development`)، TypeORM سيقوم تلقائياً بمزامنة الـ schema مع قاعدة البيانات
- لا تستخدم `synchronize: true` في الإنتاج!

