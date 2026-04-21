# عقد API — HighLit

هذا الملف **اتفاق عمل** بين فريق الباكند (Django) وفريق الفرونت (Next، Vite Admin). يجب تحديثه عند أي تغيير في المسارات أو أشكال JSON.

**الأساس الحالي:** Django REST في `backend/` — التوثيق التفاعلي: `http://localhost:8000/api/docs` (Swagger).

---

## 1. قواعد عامة

| البند | القيمة الحالية (Django) |
|--------|-------------------------|
| Base URL | `http://localhost:8000/api/v1` |
| مصادقة JWT | ترويسة `Authorization: Bearer <token>` |
| تنسيق الأجسام | JSON |
| CORS | أصول `http://localhost:3000` و`http://localhost:5173` |

---

## 2. المصادقة — `auth`

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|---------|--------|
| GET | `/auth/github` | لا | بدء OAuth GitHub |
| GET | `/auth/github/callback` | لا | رجوع GitHub |
| POST | `/auth/register` | لا | تسجيل (جسم: بيانات المستخدم حسب `RegisterDto`) |
| POST | `/auth/login` | لا | تسجيل دخول — يعيد توكن |
| GET | `/auth/me` | JWT | المستخدم الحالي |
| GET | `/auth/health` | لا | فحص صحة الخدمة |

---

## 3. المستخدمون — `users`

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|---------|--------|
| POST | `/users` | لا* | إنشاء مستخدم |
| GET | `/users` | لا | جميع المستخدمين |
| GET | `/users/:id` | لا | مستخدم بالمعرّف |
| GET | `/users/:id/rank` | لا | ترتيب/نقاط |
| PATCH | `/users/:id` | JWT | تحديث |
| POST | `/users/:id/reputation` | JWT | تحديث نقاط السمعة (`points` في الجسم) |
| DELETE | `/users/:id` | JWT | حذف |

\*قد تتطلب سياسة مختلفة في الإنتاج.

---

## 4. المنشورات — `posts`

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|---------|--------|
| POST | `/posts` | JWT | إنشاء منشور |
| GET | `/posts` | لا | قائمة — استعلام `sort` |
| GET | `/posts/rants` | لا | منشورات rant — `sort` |
| GET | `/posts/trending` | لا | رائج |
| GET | `/posts/:id` | لا | منشور بالمعرّف |
| POST | `/posts/:id/reactions` | JWT | تفاعل |
| GET | `/posts/:id/reactions` | لا | التفاعلات |
| POST | `/posts/:id/comments` | JWT | تعليق |
| GET | `/posts/:id/comments` | لا | التعليقات |
| GET | `/posts/tags` | لا | وسوم نشطة *(ترتيب المسارات في Nest قد يتعارض مع `:id` — راجع Swagger)* |
| GET | `/posts/tags/:tag` | لا | منشورات حسب الوسم |
| GET | `/posts/stats/daily` | لا | إحصاء يومي |

### منشورات الكود — `posts/code`

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|---------|--------|
| POST | `/posts/code` | JWT | إنشاء منشور كود |
| PATCH | `/posts/code/:id/roast` | JWT | تفعيل/إيقاف وضع roast |
| POST | `/posts/code/:id/review-request` | JWT | طلب مراجعة كود |

---

## 5. التوتر (تحليل) — `stress`

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|---------|--------|
| GET | `/stress` | لا | تحليل مستوى التوتر الحالي |

---

## 6. الوظائف — `jobs`

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|---------|--------|
| POST | `/jobs` | JWT | إنشاء وظيفة |
| GET | `/jobs` | لا | قائمة — فلاتر: `location`, `minSalary`, `maxSalary` |
| GET | `/jobs/locations` | لا | `locations` مفصولة بفواصل |
| GET | `/jobs/:id` | لا | وظيفة بالمعرّف |
| POST | `/jobs/:id/reviews` | JWT | مراجعة شركة |
| GET | `/jobs/:id/reviews` | لا | مراجعات |

---

## 7. الشركات — `companies`

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|---------|--------|
| POST | `/companies` | JWT | إنشاء ملف شركة |
| GET | `/companies` | لا | جميع الشركات |
| GET | `/companies/:id` | لا | شركة بالمعرّف |
| GET | `/companies/:id/jobs` | لا | وظائف الشركة |

---

## 8. المساحات الصوتية — `spaces`

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|---------|--------|
| POST | `/spaces` | JWT | إنشاء مساحة |
| GET | `/spaces` | لا | جميع المساحات |
| GET | `/spaces/live` | لا | مساحات مباشرة |
| GET | `/spaces/:id` | لا | مساحة بالمعرّف |
| PATCH | `/spaces/:id/start` | JWT | بدء |
| PATCH | `/spaces/:id/end` | JWT | إنهاء |

---

## 9. الغرفة (Room) — `room`

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|---------|--------|
| GET | `/room/me` | JWT | بيانات غرفتي الكاملة |
| GET | `/room/:userId` | لا | غرفة مستخدم (عامة جزئياً) |
| GET | `/room/code-storage` | JWT | تخزين الكود — `userId` اختياري |
| GET | `/room/code-storage/:id` | JWT | عنصر تخزين بالمعرّف |
| POST | `/room/code-storage` | JWT | إنشاء |
| PATCH | `/room/code-storage/:id` | JWT | تحديث |
| DELETE | `/room/code-storage/:id` | JWT | حذف |
| GET | `/room/dev-notes` | JWT | ملاحظات المطور |
| GET | `/room/dev-notes/:id` | JWT | ملاحظة بالمعرّف |
| POST | `/room/dev-notes` | JWT | إنشاء |
| PATCH | `/room/dev-notes/:id` | JWT | تحديث |
| DELETE | `/room/dev-notes/:id` | JWT | حذف |
| GET | `/room/ideas` | لا | أفكار — `userId` مطلوب في الاستعلام |
| GET | `/room/ideas/:id` | لا | فكرة بالمعرّف |
| POST | `/room/ideas` | JWT | إنشاء |
| PATCH | `/room/ideas/:id` | JWT | تحديث |
| DELETE | `/room/ideas/:id` | JWT | حذف |
| GET | `/room/saved-items` | JWT | عناصر محفوظة |
| POST | `/room/saved-items` | JWT | حفظ عنصر |
| DELETE | `/room/saved-items` | JWT | إلغاء حفظ — `itemType`, `itemId` |
| PATCH | `/room/status` | JWT | تحديث الحالة النصية |

---

## 10. مسارات Django المستقبلية (Placeholder — تحديث عند التنفيذ)

**الغرض:** منصة مشاريع طلابية، بوابة شركات، فلترة احترافية، لوحة أدمن. المسارات أدناه **مقترحة** — لا تُعتبر ثابتة حتى يوافق الفريق ويُنفَّذ.

| الطريقة | المسار المقترح | مصادقة | الوصف |
|---------|----------------|--------|--------|
| GET/POST | `/api/v1/student-projects/` | JWT / عام للقراءة | قائمة وإنشاء مشاريع طلابية |
| GET/PATCH/DELETE | `/api/v1/student-projects/:id/` | JWT | تفاصيل، تعديل، حذف |
| GET | `/api/v1/student-projects/?major=&year=&status=&q=` | — | فلترة وبحث |
| POST | `/api/v1/student-projects/:id/submit/` | JWT | إرسال للمراجعة |
| POST | `/api/v1/admin/projects/:id/approve/` | Staff | اعتماد |
| POST | `/api/v1/admin/projects/:id/reject/` | Staff | رفض مع سبب |
| GET | `/api/v1/company-profiles/` | — | بوابة شركات (عام/مقيّد) |
| GET | `/api/v1/companies/directory/` | — | دليل مع فلاتر |

**ملاحظة:** عند اعتماد Django، أضيفوا جدولاً كاملاً هنا أو استبدلوا هذا القسم برابط OpenAPI الثابت.

---

## 11. أشكال الاستجابة الشائعة (Nest — مرجعية)

- **تسجيل الدخول:** غالباً `{ access_token, user }` أو ما يعادله — راجع استجابة فعلية من `/auth/login` في Swagger.
- **الأخطاء:** رسائل JSON من Nest ValidationPipe عند أجسام غير صالحة.

---

## 12. سجل التغييرات (يملأه الفريق)

| التاريخ | التغيير | المسؤول |
|---------|---------|---------|
| | إنشاء العقد من كود Nest + placeholders | — |
