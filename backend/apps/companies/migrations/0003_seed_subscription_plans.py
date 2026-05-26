from django.db import migrations

PLANS = [
    {
        "tier": "FREE",
        "name": "مجاني",
        "description": "ابدأ بنشر وظيفة واحدة ومشاهدة أول 5 متقدمين مجاناً.",
        "price": 0,
        "max_active_jobs": 1,
        "max_visible_applicants": 5,
        "can_view_applicant_contact": True,
        "allows_featured_jobs": False,
        "duration_days": 36500,
        "sort_order": 0,
    },
    {
        "tier": "BASIC",
        "name": "أساسي",
        "description": "حتى 5 وظائف نشطة و25 متقدماً لكل وظيفة.",
        "price": 49,
        "max_active_jobs": 5,
        "max_visible_applicants": 25,
        "can_view_applicant_contact": True,
        "allows_featured_jobs": False,
        "duration_days": 30,
        "sort_order": 1,
    },
    {
        "tier": "PRO",
        "name": "احترافي",
        "description": "حتى 20 وظيفة، 200 متقدم لكل وظيفة، وإعلانات مميّزة.",
        "price": 149,
        "max_active_jobs": 20,
        "max_visible_applicants": 200,
        "can_view_applicant_contact": True,
        "allows_featured_jobs": True,
        "duration_days": 30,
        "sort_order": 2,
    },
    {
        "tier": "ENTERPRISE",
        "name": "مؤسسي",
        "description": "وظائف ومتقدمون بلا حدود مع كامل المزايا.",
        "price": 399,
        "max_active_jobs": 100000,
        "max_visible_applicants": 100000,
        "can_view_applicant_contact": True,
        "allows_featured_jobs": True,
        "duration_days": 30,
        "sort_order": 3,
    },
]


def seed_plans(apps, schema_editor):
    SubscriptionPlan = apps.get_model("companies", "SubscriptionPlan")
    for plan in PLANS:
        SubscriptionPlan.objects.update_or_create(tier=plan["tier"], defaults=plan)


def unseed_plans(apps, schema_editor):
    SubscriptionPlan = apps.get_model("companies", "SubscriptionPlan")
    SubscriptionPlan.objects.filter(tier__in=[p["tier"] for p in PLANS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("companies", "0002_subscriptionplan_companysubscription"),
    ]

    operations = [
        migrations.RunPython(seed_plans, unseed_plans),
    ]
