# سير عمل Git — فريق HighLit

دليل موحّد لـ **الليدر والمطورين** لتجنب تضارب العمل وفقدان التغييرات.

---

## 1. تهيئة المستودع (إن لم يكن مهيأً)

من جذر المشروع:

```powershell
cd c:\Users\qa3dn\Desktop\HighLit
git init
git branch -M main
```

أضف [`.gitignore`](../.gitignore) (أنشئه إن لم يكن موجوداً) ليشمل على الأقل:

- `node_modules/`
- `frontend/.next/`
- `backend/dist/`
- `.env` و `.env.local` و `*.env`
- `__pycache__/`, `.venv/`, `*.pyc`
- `.idea/`, `.vscode/` (اختياري حسب الفريق)

**لا ترفع أسراراً** (مفاتيح JWT، كلمات مرور قواعد البيانات).

---

## 2. الفروع

| الفرع | الغرض |
|--------|--------|
| `main` | كود مستقر وجاهز للعرض أو التسليم |
| `develop` | تكامل يومي للميزات (مقترح قوي) |

**قاعدة:** لا تدفع مباشرة إلى `main` دون مراجعة (Pull Request) إن أمكن.

### تسمية فروع العمل

| النمط | مثال |
|--------|------|
| ميزة | `feature/django-api-v1` |
| إصلاح | `fix/login-redirect` |
| وثائق | `docs/api-contract-update` |

---

## 3. دورة عمل يومية

1. سحب آخر التغييرات:

```powershell
git checkout develop
git pull origin develop
```

2. إنشاء فرع للمهمة:

```powershell
git checkout -b feature/my-task
```

3. commits صغيرة وواضحة:

```powershell
git add .
git commit -m "feat(projects): add filter query params"
```

4. دفع الفرع:

```powershell
git push -u origin feature/my-task
```

5. فتح **Pull Request** إلى `develop` (أو `main` إذا لم يُستخدم `develop`).

---

## 4. رسائل الـ commit (مقترحة)

- `feat:` ميزة جديدة  
- `fix:` إصلاح خلل  
- `docs:` وثائق فقط  
- `chore:` صيانة (تبعيات، إعدادات)

مثال: `fix(auth): handle expired JWT on refresh`

---

## 5. Pull Request — checklist

- [ ] المشروع يبني محلياً (`npm run build` أو ما يناسب الجزء المعدّل).
- [ ] لا ملفات `.env` أو أسرار.
- [ ] تحديث [API_CONTRACT.md](API_CONTRACT.md) إذا تغيّر الـ API.
- [ ] مراجعة زميل (خاصة قبل الدمج في `main`).

---

## 6. حل التعارضات

```powershell
git fetch origin
git merge origin/develop
# عالج الملفات المتعارضة يدوياً
git add .
git commit -m "merge: resolve conflicts with develop"
```

---

## 7. أدوار مقترحة

| الدور | المسؤولية |
|--------|-----------|
| الليدر | حماية `main`، دمج PRs، حل التعارضات الكبيرة |
| الباكند | فروع `feature/` ضمن مجلد الباكند مع مراجعة العقد |
| الفرونت | نفس النمط + تنسيق مع `API_CONTRACT` |

---

## 8. عضو لم يُسجّل بعد في Git

```powershell
git config --global user.name "الاسم"
git config --global user.email "email@example.com"
```

---

## مراجع

- [PROJECT_RUNBOOK.md](PROJECT_RUNBOOK.md) — تشغيل المشروع  
- [API_CONTRACT.md](API_CONTRACT.md) — تغييرات الـ API
