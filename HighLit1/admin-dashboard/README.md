# 🚀 Project Name

## 📌 Overview

This is a frontend project built using React + Vite with a clean architecture based on features.

---

## 🧱 Project Structure

* `app/` → routing + providers
* `components/` → reusable UI
* `features/` → main features (users, companies, projects...)
* `services/` → API client (axios)
* `context/` → global state
* `routes/` → route protection
* `utils/` → helper functions

---

## ▶️ Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run project

```bash
npm run dev
```

---

## 🧠 Architecture Rules

* Page → Hook → Service
* No API calls inside components
* Reusable UI only from components/ui
* Each feature is isolated

---

## 👥 Team Workflow

* Work on `develop` branch
* Create feature branches
* Use Pull Requests
* No direct push to `main`

---

## 🔐 Roles

* Admin
* Student
* Company

---

## 📦 Tech Stack

* React
* Vite
* Axios
* React Router
