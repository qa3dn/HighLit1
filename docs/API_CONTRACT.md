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

## 6. الوظائف والتوظيف — `jobs` (نظام شبيه بـ LinkedIn)

نموذج `Job` موسّع: `job_type` (PAID/INTERNSHIP/FREELANCE)، `employment_type` (FULL_TIME/PART_TIME/CONTRACT/TEMPORARY)، `workplace_type` (ONSITE/REMOTE/HYBRID)، `experience_level` (ENTRY/MID/SENIOR/LEAD)، `skills[]`، `currency`، `status` (DRAFT/PUBLISHED/CLOSED)، `is_featured` (إعلان مدفوع — لا يُضبط ذاتياً)، `application_deadline`، `company_profile`.

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|---------|--------|
| GET | `/jobs` | لا | الوظائف **المنشورة** فقط (المميّزة أولاً). فلاتر: `type`, `q`, `location`, `workplace`, `experience` |
| POST | `/jobs` | مدير شركة | نشر وظيفة لشركتك (`company_slug` اختياري). يفرض حصّة الباقة → **402** `job_quota_reached` عند التجاوز |
| GET | `/jobs/locations` | لا | المواقع المتاحة |
| GET | `/jobs/mine` | JWT | وظائف الشركات التي تديرها (كل الحالات + عدد المتقدمين) |
| GET | `/jobs/my-applications` | JWT | طلبات المستخدم الحالي |
| GET | `/jobs/:id` | لا* | تفاصيل (غير المنشورة تظهر للمدير/الأدمن فقط) — يتضمّن `has_applied`, `application_count` |
| PATCH/DELETE | `/jobs/:id` | مدير/أدمن | تعديل/إغلاق/حذف الوظيفة |
| POST | `/jobs/:id/apply` | JWT | تقديم (`cover_letter`, `resume_url`) — **409** عند التكرار، **400** على وظيفة شركتك |
| GET | `/jobs/:id/applicants` | مدير/أدمن | المتقدمون **مع تطبيق البوّابة**: المدير يرى حتى `max_visible_applicants` (5 مجاناً) + `locked_count`؛ الأدمن يرى الكل |
| PATCH | `/jobs/applications/:id` | مدير/أدمن | تغيير حالة الطلب (PENDING/REVIEWED/SHORTLISTED/REJECTED/ACCEPTED) |
| GET/POST | `/jobs/:id/reviews` | لا / JWT | مراجعات الشركة |

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

## 10. مشاريع الطلاب — `student-projects` (مُنفَّذ)

**الغرض:** معرض «فرجينا شغلك» — مشاريع بصور (رفع)، روابط GitHub، فيديو مضمّن (YouTube/Vimeo/Drive)، مع جامعة وتخصص للفلترة.

### المسارات

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|--------|--------|
| GET/POST | `/api/v1/student-projects` | GET عام؛ POST JWT | قائمة منشورة / إنشاء (فوري `PUBLISHED`) |
| GET | `/api/v1/student-projects/mine` | JWT | مشاريع المستخدم (كل الحالات) |
| GET | `/api/v1/student-projects/facets` | عام | قيم `universities` و `majors` للفلاتر |
| GET/PATCH/DELETE | `/api/v1/student-projects/:id` | GET عام إن منشور؛ تعديل/حذف المالك أو ADMIN | تفاصيل ومتابعة |
| POST | `/api/v1/student-projects/:id/hide` | ADMIN | إخفاء (`HIDDEN`) — يُسجَّل `project.hidden` |
| POST | `/api/v1/student-projects/:id/reject` | ADMIN | رفض (`REJECTED`) — جسم: `{ "reason": "..." }`، يُسجَّل `project.rejected` |
| POST | `/api/v1/student-projects/:id/approve` | ADMIN | إعادة للنشر (`PUBLISHED`) وتمسح سبب الرفض — يُسجَّل `project.approved` |

### استعلامات القائمة (GET)

| المعامل | الوصف |
|---------|--------|
| `university` | فلترة بالجامعة (يحتوي) |
| `major` | فلترة بالتخصص |
| `year` | السنة الدراسية (`academic_year`) |
| `project_type` | `IMAGE` \| `GITHUB` \| `VIDEO` \| `MIXED` |
| `q` | بحث في العنوان والملخص والوصف والجامعة والتخصص |
| `status` | للمسؤول فقط: `PUBLISHED` \| `HIDDEN` \| `REJECTED` |
| `ordering` | `-created_at` (افتراضي)، `view_count`، `title` |

### جسم الإنشاء (POST)

```json
{
  "title": "string",
  "summary": "string",
  "description": "string",
  "university": "string",
  "major": "string",
  "academic_year": "2026",
  "project_type": "MIXED",
  "github_url": "https://github.com/...",
  "demo_url": "https://...",
  "video_url": "https://youtube.com/...",
  "cover_image": "http://localhost:8000/media/projects/....jpg",
  "gallery_images": ["url1", "url2"],
  "tech_stack": ["React", "Django"],
  "tags": []
}
```

### رفع الصور — `uploads`

| POST | `/api/v1/uploads/file` | JWT | حقل `file` — يُرجع `{ "url", "filename", "content_type", "size" }` — حد 5MB، صيغ: jpeg/png/webp/gif |

### حقول المستخدم (`auth/me`)

أُضيف `university` و `major` لملء نموذج النشر تلقائياً.

---

## 11. الشركات — `companies` (مُنفَّذ — بوابة شبيهة بـ LinkedIn)

قوائم الشركات والمنشورات والوظائف والنشاطات **مرقّمة الصفحات** (`{count,next,previous,results}`)
بحدّ أقصى `page_size=200`. باقي المسارات تُعيد كائناً واحداً.

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|--------|--------|
| GET/POST | `/api/v1/companies` | GET عام؛ POST JWT | قائمة/بحث (`q`, `industry`, `verified`) / إنشاء شركة (المنشئ يصبح OWNER) |
| GET | `/api/v1/companies/mine` | JWT | الشركات التي أملكها أو أنا عضو فيها |
| GET/PATCH/DELETE | `/api/v1/companies/:slug` | GET عام؛ تعديل/حذف للمدير | ملف الشركة الكامل (+ الأعضاء + المعرض) |
| POST/DELETE | `/api/v1/companies/:slug/follow` | JWT | متابعة/إلغاء متابعة (عدّاد ذرّي) |
| GET/POST | `/api/v1/companies/:slug/members` | GET عام؛ POST للمدير | الأعضاء/الموظفون |
| PATCH/DELETE | `/api/v1/companies/:slug/members/:member_id` | للمدير | تعديل/إزالة عضو |
| GET/POST | `/api/v1/companies/:slug/posts` | GET عام؛ POST للمدير | منشورات الشركة |
| GET/POST | `/api/v1/companies/posts/:post_id/reactions` | GET عام؛ POST JWT | تفاعلات منشور |
| GET/POST | `/api/v1/companies/posts/:post_id/comments` | GET عام؛ POST JWT | تعليقات منشور |
| GET/POST | `/api/v1/companies/:slug/media` | GET عام؛ POST للمدير | معرض الوسائط |
| GET | `/api/v1/companies/:slug/jobs` | عام | وظائف الشركة (Job المرتبط عبر `company_profile`) |
| GET | `/api/v1/companies/:slug/analytics` | للمدير | إحصاءات (متابعون، أعضاء، منشورات، وظائف) |
| POST | `/api/v1/companies/:slug/verify` | ADMIN | توثيق/إلغاء توثيق (`is_verified`) |

«المدير» = مالك الشركة، أو عضو بدور OWNER/ADMIN، أو مسؤول المنصّة (ADMIN).

### 11.1 الاشتراكات والباقات (`SubscriptionPlan` / `CompanySubscription`)

الباقات بيانات قابلة للتعديل (مزروعة عبر migration): `FREE` (1 وظيفة، 5 متقدمين)، `BASIC`، `PRO` (إعلانات مميّزة)، `ENTERPRISE`. تتحكّم الباقة في: عدد الوظائف النشطة، عدد المتقدمين المرئيين لكل وظيفة، ظهور بيانات التواصل، والإعلانات المميّزة. لا توجد بوّابة دفع — الشركة ترسل طلباً والأدمن يفعّله.

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|--------|--------|
| GET | `/api/v1/companies/plans` | عام | الباقات المتاحة |
| GET | `/api/v1/companies/:slug/subscription` | للمدير | الباقة الحالية + الطلب المعلّق + الحدود + الاستخدام |
| POST | `/api/v1/companies/:slug/subscription` | للمدير | طلب باقة (`plan_id`) → PENDING — **409** إن وُجد طلب معلّق |
| GET | `/api/v1/companies/subscriptions` | ADMIN | كل الطلبات (فلتر `status`) — مرقّم |
| POST | `/api/v1/companies/subscriptions/:id/activate` | ADMIN | تفعيل (ACTIVE + تاريخ انتهاء؛ يلغي الاشتراك النشط السابق) |
| POST | `/api/v1/companies/subscriptions/:id/reject` | ADMIN | رفض (`note`) |
| GET/POST | `/api/v1/companies/admin/plans` | ADMIN | إدارة الباقات (تشمل غير المفعّلة)؛ إنشاء — يُسجَّل `plan.created` |
| GET/PATCH/DELETE | `/api/v1/companies/admin/plans/:id` | ADMIN | عرض/تعديل/حذف باقة (الحذف يُرفض إن كانت مرتبطة باشتراكات) — `plan.updated`/`plan.deleted` |
| GET/POST | `/api/v1/companies/admin/promo-codes` | ADMIN | أكواد الخصم (campaigns): `code`, `discount_type` (PERCENT/FIXED), `amount`, `plan?`, `valid_from?`, `valid_until?`, `max_uses?`, `is_active` — `is_redeemable` محسوب |
| GET/PATCH/DELETE | `/api/v1/companies/admin/promo-codes/:id` | ADMIN | عرض/تعديل/حذف كود خصم — `promocode.created`/`updated`/`deleted` |
| GET | `/api/v1/companies/admin/invoices` | ADMIN | الفواتير (فلتر `status`/`company`) — مرقّمة؛ تشمل `payments[]` |
| GET | `/api/v1/companies/admin/invoices/:id` | ADMIN | تفاصيل فاتورة + المدفوعات |
| POST | `/api/v1/companies/admin/invoices/:id/pay` | ADMIN | تسوية يدوية (`idempotency_key` اختياري) → PAID — يُسجَّل `invoice.paid` |
| POST | `/api/v1/companies/admin/invoices/:id/void` | ADMIN | إبطال فاتورة مفتوحة — `invoice.voided` |
| POST | `/api/v1/companies/billing/webhook?gateway=CLIQ\|CLICK` | توقيع HMAC | استقبال إشعار الدفع — يتحقّق من التوقيع (`CLIQ_WEBHOOK_SECRET`)؛ **fail‑closed** بلا سر؛ idempotent عبر `event_id` |

> **الفوترة:** تفعيل اشتراك بباقة مدفوعة (`price>0`) يُنشئ فاتورة `OPEN` تلقائياً (يقبل `promo_code` للخصم). التسوية يدوية الآن (`/pay`) أو عبر webhook موقّع. المال `Decimal` بعملة الباقة (JOD). التسوية ذرّية (`select_for_update`) و idempotent عبر `Payment.idempotency_key` الفريد. أفعال التدقيق: `invoice.paid`/`invoice.voided`.

| GET/POST | `/api/v1/companies/admin/campaigns` | ADMIN | الحملات الترويجية (فلتر `status`، مرقّمة)؛ إنشاء: `company`, `name`, `target_type` (JOB/COMPANY), `job?`, `price`, `starts_at`, `ends_at` — `campaign.created` |
| GET/PATCH/DELETE | `/api/v1/companies/admin/campaigns/:id` | ADMIN | عرض/تعديل/حذف حملة (الحذف يُلغي تمييز الوظيفة إن كانت نشطة) — `campaign.deleted` |
| POST | `/api/v1/companies/admin/campaigns/:id/activate` | ADMIN | تفعيل: يميّز الوظيفة الهدف (`is_featured=True`) ويفتح فاتورة للمبلغ (ذرّي) — `campaign.activated` |
| POST | `/api/v1/companies/admin/campaigns/:id/end` | ADMIN | إنهاء (`EXPIRED`) ويلغي تمييز الوظيفة — `campaign.ended` |

## 12. الإدارة والتدقيق — `moderation` / `audit` (ADMIN فقط)

| الطريقة | المسار | الوصف |
|---------|--------|--------|
| GET | `/api/v1/moderation/overview` | لقطة لوحة الأدمن في طلب واحد (مستخدمون/محتوى/مشاريع/شركات + آخر النشاطات + تحليلات النشاط الأسبوعي واستخدام التقنيات وأحدث التقييمات) — الشكل أدناه |
| GET | `/api/v1/moderation/posts` | كل المنشورات للمراجعة — فلترة `q` (المحتوى/الكاتب)، `type`، `hidden` (`true`/`false`)، `ordering` (`recent`/`top`)، `page`/`limit`. يُرجع `{results,total,page,limit,has_more}` ويُظهر الكاتب الحقيقي حتى للمجهول |
| PATCH | `/api/v1/moderation/posts/:id` | إخفاء/إظهار منشور (`{is_hidden: bool}`) — قابل للتراجع، يُسجَّل في التدقيق |
| DELETE | `/api/v1/moderation/posts/:id` | حذف منشور نهائياً (يُسجَّل في التدقيق) |
| GET | `/api/v1/moderation/comments` | كل التعليقات للمراجعة — فلترة `q`، `post_id`، `hidden`، `page`/`limit` |
| PATCH | `/api/v1/moderation/comments/:id` | إخفاء/إظهار تعليق (`{is_hidden: bool}`) — يُسجَّل في التدقيق |
| DELETE | `/api/v1/moderation/comments/:id` | حذف تعليق نهائياً (يُسجَّل في التدقيق) |
| GET | `/api/v1/moderation/jobs` | كل الوظائف للإشراف (كل الحالات/الشركات) — فلترة `q`، `status`، `type`، `featured` + عدد المتقدمين. يُرجع `{results,total,...}` |
| POST | `/api/v1/moderation/jobs/:id/feature` | تمييز/إلغاء تمييز وظيفة (`{is_featured: bool}`، إعلان مدفوع — يُسجَّل في التدقيق) |
| GET | `/api/v1/audit` | سجل التدقيق (مرقّم؛ فلترة `action`, `actor`) |

> الأدمن يرى كل المتقدمين بلا بوّابة عبر `GET /api/v1/jobs/:id/applicants`، ويغلق/يحذف أي وظيفة عبر `PATCH/DELETE /api/v1/jobs/:id`. أفعال التدقيق: `job.featured`/`job.unfeatured`.

> المحتوى المخفي (`is_hidden=True`) يبقى في قاعدة البيانات لكنه يُستبعَد من كل مسارات القراءة العامة (الفيد، الفضفضات، الترند، الوسوم، التفاصيل، التعليقات، الإحصائيات). الإجراءات تُسجَّل بأفعال `post.hidden`/`post.unhidden`/`post.deleted` و`comment.*`.

**شكل `GET /api/v1/moderation/overview`** (كل البيانات حقيقية من قاعدة البيانات):

```json
{
  "users":    { "total": 0, "banned": 0, "admins": 0, "companies": 0 },
  "content":  { "posts": 0, "comments": 0, "reactions": 0 },
  "projects": { "published": 0, "hidden": 0, "rejected": 0 },
  "companies":{ "total": 0, "verified": 0, "jobs": 0 },
  "recent_activity": [ /* آخر 10 أحداث تدقيق (AuditEvent) */ ],
  "weekly_activity": [
    { "date": "2026-05-28", "actions": 0, "active_users": 0 }
    /* 7 عناصر، الأقدم أولاً؛ actions=عدد أحداث التدقيق، active_users=الفاعلون المميَّزون */
  ],
  "tech_usage": [
    { "name": "React", "value": 12 }
    /* أعلى 6 تقنيات من tech_stack للمشاريع المنشورة، تنازلياً */
  ],
  "recent_reviews": [
    { "id": 1, "author": "username", "job_title": "...", "rating": 5, "comment": "...", "created_at": "ISO" }
    /* أحدث 5 تقييمات (JobReview) */
  ]
}
```

## 13. تحديثات المستخدمين والصلاحيات (`users`)

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|--------|--------|
| POST | `/api/v1/users/:id/role` | ADMIN | تعيين الدور (المسار الوحيد الذي يغيّر `role`) |
| POST | `/api/v1/users/:id/ban` | ADMIN | حظر/رفع الحظر عبر `is_active` |
| POST | `/api/v1/users/:id/reputation` | ADMIN | تعديل النقاط (`{points}` مقيَّد بـ ±100) |
| GET | `/api/v1/users/:id/admin-detail` | ADMIN | لقطة كاملة لحساب واحد في طلب واحد — الشكل أدناه |
| POST | `/api/v1/users/:id/set-password` | ADMIN | تعيين كلمة مرور مؤقتة (`{password}`، ≥ 8 أحرف + مدقّقات Django) — يُرفض على مدير آخر؛ يُسجَّل `user.password_set` دون كلمة المرور |

**شكل `GET /api/v1/users/:id/admin-detail`** (للأدمن فقط؛ `date_joined`/`last_login` تظهر هنا فقط):

```json
{
  "user": { "id":1, "username":"...", "email":"...", "role":"USER|ADMIN|COMPANY",
            "rank":"...", "reputation_points":0, "is_active":true,
            "is_staff":false, "is_superuser":false, "date_joined":"ISO", "last_login":"ISO|null",
            "bio":"...", "university":"...", "major":"...", "github_username":"...",
            "profile_visibility":"PUBLIC|PRIVATE", "show_posts":true, "show_code":true,
            "show_ideas":true, "show_activity":true, "avatar_url":"...", "banner_url":"...", "status_text":"..." },
  "stats": { "posts":0, "comments":0, "projects":0, "jobs_created":0, "applications":0,
             "reputation_points":0, "rank":"NOVICE" },
  "companies": {
    "items": [ { "id":1, "name":"...", "slug":"...", "status":"PENDING|APPROVED|REJECTED",
                 "is_verified":false, "follower_count":0, "job_count":0, "created_at":"ISO" } ],
    "counts": { "PENDING":0, "APPROVED":0, "REJECTED":0 }, "total":0
  },
  "memberships": [ { "company_id":1, "name":"...", "slug":"...", "status":"...", "is_verified":false, "role":"OWNER|ADMIN|EMPLOYEE" } ],
  "recent_activity": [ /* آخر 10 أحداث تدقيق (AuditEvent) للمستخدم */ ]
}
```

> ملاحظات: الموافقة على طلب إنشاء شركة تتم عبر مسارات `companies` القائمة (`/companies/:slug/approve|reject|verify`)؛ إنشاء شركة جديدة (`POST /companies`) يبدأ بحالة `PENDING`. تعديل بيانات الشركة من لوحة المستخدم يستخدم `PATCH /companies/:slug` (الأدمن يَعبُر فحص `is_company_manager`).

**ملاحظات أمنية مطبّقة:** الصلاحية الافتراضية أصبحت `IsAuthenticated` (المسارات العامة تعلن
`AllowAny` صراحةً)؛ `role`/`rank`/`reputation_points`/`is_active` للقراءة فقط في `UserSerializer`؛
الـ `register` لا يقبل `role`؛ مسارات `room` للتفاصيل مقيّدة بالمالك (إصلاح IDOR)؛ تحديد معدّل
على `auth`؛ الأخطاء تُعاد بمغلّف موحّد دون تسريب التتبّع.

---

## 14. الفيد والمنشورات (محدّث)

**شكل المنشور (`PostSerializer`):** `id, user_id, author{id,username,avatar_url,rank}|null,
is_anonymous, title, content, type, tags[], roast_mode, reaction_count, comment_count,
viewer_reactions[], created_at`. (`author=null` عند `is_anonymous`.)

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|--------|--------|
| GET | `/api/v1/posts/feed` | عام (مُقيَّد) | الفيد المرتّب. مُغلّف: `{posts, total, page, limit, has_more, locked, remaining_locked, is_authenticated, sort}` |
| POST | `/api/v1/posts` | JWT | إنشاء منشور (تحقّق: محتوى غير فارغ، حد 5000 حرف، ≤10 وسوم؛ تحديد معدّل `20/min`) |
| POST | `/api/v1/posts/:id/reactions` | JWT | **تبديل** التفاعل (إضافة/إزالة) — يعيد `{reacted, totals, reaction_count}` |
| POST | `/api/v1/auth/refresh` | لا | تجديد رمز الوصول: جسم `{refresh}` → `{access}` |

**فلاتر الفيد:** `sort=hot|recent|top` (افتراضي hot)، `tag`، `q`، `type` (افتراضي RANT)،
`page`، `limit` (≤50).

**التقييد (Gating) المفروض من الخادم:** الزائر غير المسجّل لا يحصل أبداً على أكثر من **5**
منشورات من `feed`/`posts`/`rants` مهما كانت المعاملات؛ `locked=true` و`remaining_locked` تشيران
لوجود محتوى محجوب. خوارزمية «hot» = (تفاعلات + ٢×تعليقات + ١) ÷ (عمر بالساعات + ٢)^١٫٥.

## 15. الملف الشخصي العام والخصوصية

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|--------|--------|
| GET | `/api/v1/profiles/:user_id` | عام | الملف الشخصي العام في طلب واحد (هوية + نشاط + منشورات + مستودعات + أفكار + GitHub) |
| GET | `/api/v1/profiles/github-repos?username=` | عام | مستودعات GitHub العامة لاسم مستخدم (مُخبّأة، بيانات عامة فقط) |
| PATCH | `/api/v1/users/:id` | المالك/ADMIN | تعديل حقول الملف والخصوصية (انظر `UserSerializer`) |

**حقول الملف الجديدة (`User`):** `banner_url`, `github_username`, `profile_visibility`
(PUBLIC/PRIVATE), و`show_posts`/`show_code`/`show_ideas`/`show_activity`. قابلة للتعديل للمالك فقط؛
`role`/`rank`/`reputation_points`/`is_active` للقراءة فقط.

**استجابة `/profiles/:id`:** `{ profile, is_private, is_owner, visibility, activity, posts[],
code[], ideas[], github_repos[] }`. عند `profile_visibility=PRIVATE` لغير المالك → استجابة مصغّرة
`{ id, username, avatar_url, is_private: true }` فقط.

**فرض الخصوصية من الخادم:** الأقسام المخفية لا تُسلسَل أصلاً في الاستجابة (ليست إخفاءً في الواجهة)؛
المالك (والـ ADMIN) يتجاوز القيود لرؤية ملفه. لا يُسرَّب البريد الإلكتروني أبداً في `/profiles`.
GitHub: بيانات عامة فقط (لا OAuth/رموز) واسم المستخدم يُتحقَّق منه (مضاد لـ SSRF).

## 16. مشاريع الكود — `code-projects` (مستودعات بنمط مصغّر لـ GitHub)

مشاريع متعددة الملفات مع README ووسوم ولغة وسجل تحديثات وتصدير ZIP. الظهور: `PUBLIC`
(مدرج) / `UNLISTED` (بالرابط فقط) / `PRIVATE` (المالك فقط — مفروض من الخادم).

| الطريقة | المسار | مصادقة | الوصف |
|---------|--------|--------|--------|
| GET/POST | `/api/v1/code-projects` | GET عام (PUBLIC فقط)؛ POST JWT | قائمة عامة (q/tag/language/user_id، مرقّمة) / إنشاء |
| GET | `/api/v1/code-projects/mine` | JWT | كل مشاريعي (بكل مستويات الظهور) |
| GET/PATCH/DELETE | `/api/v1/code-projects/:slug` | GET حسب الظهور؛ تعديل/حذف للمالك | تفاصيل (+ files + updates) |
| POST | `/api/v1/code-projects/:slug/files` | المالك | إضافة ملف (`path`,`content`؛ تحقّق من المسار/الحجم) |
| PATCH/DELETE | `/api/v1/code-projects/:slug/files/:id` | المالك | تعديل/حذف ملف |
| GET/POST | `/api/v1/code-projects/:slug/updates` | GET حسب الظهور؛ POST للمالك | سجل التحديثات (كومِتات مبسّطة) |
| GET | `/api/v1/code-projects/:slug/download` | حسب الظهور | تنزيل المشروع كـ ZIP |

**أمان:** مسارات الملفات تُنقّى (لا `..`/جذور) فيكون تصدير ZIP آمناً من اختراق المسار؛ حدود الحجم
(200KB/ملف، 100 ملف/مشروع)؛ تحديد معدّل على الإنشاء؛ المشاريع الخاصة لا تظهر في القوائم ولا
بالتفاصيل لغير المالك (404). `linked_post` يربط المشروع بمنشور (للمالك فقط).

## 17. أشكال الاستجابة الشائعة

- **تسجيل الدخول/التسجيل:** `{ access_token, refresh_token, user }`.
- **الأخطاء:** أخطاء DRF القياسية (`detail`/أخطاء الحقول) + `request_id`؛ أخطاء الخادم غير
  المتوقّعة تُعاد كـ `{ "error": { "code": "INTERNAL", "request_id": "..." } }` دون تسريب التفاصيل.

---

## 18. سجل التغييرات (يملأه الفريق)

| التاريخ | التغيير | المسؤول |
|---------|---------|---------|
| | إنشاء العقد من كود Nest + placeholders | — |
| 2026-05-21 | بوابة الشركات + التدقيق + لقطة الأدمن + صلاحيات الأدوار + تشديد أمني | — |
| 2026-05-21 | فيد مرتّب + تقييد الزوّار + تبديل التفاعل + تجديد الرمز + شكل منشور موحّد | — |
| 2026-05-21 | ملف شخصي عام + خصوصية مفروضة من الخادم + GitHub بالاسم + روابط الملفات | — |
| 2026-05-21 | مخزن الكود = مستودعات متعددة الملفات (mini-GitHub) + README + ZIP + ظهور | — |
| 2026-05-21 | لوحة إدارة المحتوى: قائمة/بحث/فلترة المنشورات والتعليقات + إخفاء/إظهار (`is_hidden`) + حذف نهائي + تدقيق؛ المحتوى المخفي يُستبعَد من المسارات العامة | — |
| 2026-05-22 | محرّك التوظيف (backend): توسعة Job (أنواع/حالة/مميّز) + JobApplication + باقات اشتراك (FREE/BASIC/PRO/ENTERPRISE) + بوّابة المتقدمين (5 مجاناً) + طلب/تفعيل الاشتراك عبر الأدمن. الواجهات لاحقاً | — |
| 2026-05-22 | واجهات التوظيف: صفحة الوظائف العامة (بحث/فلترة + تقديم) + بوابة الشركة (نشر وظائف + متابعة المتقدمين بالبوّابة + الاشتراك) + لوحة الأدمن (إشراف الوظائف + تمييز + طابور موافقة الاشتراكات) | — |
