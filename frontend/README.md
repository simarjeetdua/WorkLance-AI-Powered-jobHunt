# WorkLance — AI-Powered Freelancing Platform

A premium, production-grade React frontend for an AI-powered freelancing platform, built with modern tooling and stunning animations.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 🏗️ Tech Stack

| Tool | Purpose |
|------|---------|
| **React 18 + Vite** | Framework & build tool |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Axios** | API communication |
| **React Router v6** | Client-side routing |
| **Recharts** | Analytics charts |
| **react-hot-toast** | Toast notifications |
| **lucide-react** | Icons |

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/         # Navbar, Sidebar, Footer
│   ├── shared/         # JobCard, ApplicationCard, ReviewCard, ProtectedRoute
│   └── ui/             # Avatar, Badge, Modal, Skeleton, StatCard, StarRating
├── context/
│   ├── AuthContext.jsx # JWT auth state
│   └── ThemeContext.jsx# Dark/light toggle
├── hooks/
│   └── useAsync.js     # useAsync, useMutation, useDebounce, useLocalStorage
├── layouts/
│   ├── DashboardLayout.jsx
│   └── PublicLayout.jsx
├── pages/
│   ├── LandingPage.jsx
│   ├── auth/           # Login, Register
│   ├── dashboard/      # Role-based dashboards, Applications, MyJobs, Recommendations
│   ├── jobs/           # JobsPage, JobDetailPage, PostJobPage
│   ├── profile/        # ProfilePage (editable)
│   ├── escrow/         # EscrowPage
│   ├── reviews/        # ReviewsPage
│   └── admin/          # AdminUsersPage, AnalyticsPage
├── services/
│   └── api.js          # All Axios API calls, interceptors
└── utils/
    └── helpers.js      # formatCurrency, timeAgo, getInitials, etc.
```

## 🔐 Auth Flow

1. User registers/logs in → JWT returned from `/auth/login`
2. Token stored in `localStorage` as `wl_token`
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. `AuthContext` exposes `user`, `login`, `logout`, `register`
5. `ProtectedRoute` wraps private routes; redirects to `/login` if unauthenticated
6. Role-based access: `roles={['admin']}` prop restricts by user role

## 🎭 Roles

| Role | Dashboard | Can Do |
|------|-----------|--------|
| `freelancer` | FreelancerDashboard | Browse jobs, apply, AI recommendations, profile |
| `client` | ClientDashboard | Post jobs, view applications, manage listings |
| `admin` | AdminDashboard | User management, analytics, job moderation |

## 🔌 API Base URL

The frontend uses an environment variable for the backend URL.

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

In `src/services/api.js`:

```js
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});
```

For production (Vercel), add the same `VITE_API_URL` environment variable in your Vercel project settings.

## ✨ Design System

- **Colors**: Deep dark (`#0a0f1a`) base, emerald brand (`#25a36b`), cyan accent
- **Typography**: Clash Display (headings) + Satoshi (body) + JetBrains Mono (code)
- **Components**: glassmorphism cards, gradient buttons, animated sidebar
- **Motion**: Page transitions, staggered list reveals, hover micro-interactions
- **Themes**: Dark mode default, light mode via ThemeContext toggle

## 📦 Build for Production

```bash
npm run build
npm run preview
```
