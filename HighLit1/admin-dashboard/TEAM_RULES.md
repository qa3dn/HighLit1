# 📏 Team Rules

## 🚫 Forbidden

* ❌ No API calls inside components
* ❌ No direct push to main
* ❌ No duplicate UI components
* ❌ No logic inside UI components

---

## ✅ Required

* ✔️ Use feature structure
* ✔️ Use hooks for logic
* ✔️ Use services for API
* ✔️ Use shared UI components

---

## 🌿 Git Workflow

1. Pull latest changes

```bash
git checkout develop
git pull
```

2. Create branch

```bash
git checkout -b feature/your-feature-name
```

3. Work and commit

```bash
git add .
git commit -m "feat: your feature"
```

4. Push

```bash
git push origin feature/your-feature-name
```

5. Open Pull Request

---

## 🧠 Naming Convention

* feature/users
* feature/companies
* feature/projects
* fix/login-bug

---

## 🔍 Code Review

* PR must be reviewed before merge
* Follow structure strictly
* Clean and readable code

---

## 🧱 Architecture

Page → Hook → Service

---

## 🎯 Goal

Keep code clean, scalable, and maintainable
