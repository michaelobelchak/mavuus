import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Public Pages (eager — landing page performance)
import HomePage from './pages/public/HomePage'
import AboutPage from './pages/public/AboutPage'
import PricingPage from './pages/public/PricingPage'
import ContactPage from './pages/public/ContactPage'
import ResourcesHubPage from './pages/public/ResourcesHubPage'
import ArticlesPage from './pages/public/ArticlesPage'
import EventsPage from './pages/public/EventsPage'
import BlogDetailPage from './pages/public/BlogDetailPage'

// Auth Pages (eager — fast login)
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Dashboard Pages (lazy — code-split behind auth)
const AcademyPage = lazy(() => import('./pages/dashboard/AcademyPage'))
const LiveSessionsPage = lazy(() => import('./pages/dashboard/LiveSessionsPage'))
const OnDemandPage = lazy(() => import('./pages/dashboard/OnDemandPage'))
const ResourcesPage = lazy(() => import('./pages/dashboard/ResourcesPage'))
const MembersPage = lazy(() => import('./pages/dashboard/MembersPage'))
const MemberProfilePage = lazy(() => import('./pages/dashboard/MemberProfilePage'))
const VendorsPage = lazy(() => import('./pages/dashboard/VendorsPage'))
const JobsPage = lazy(() => import('./pages/dashboard/JobsPage'))
const JobDetailPage = lazy(() => import('./pages/dashboard/JobDetailPage'))
const MyJobsPage = lazy(() => import('./pages/dashboard/MyJobsPage'))
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'))
const SessionDetailPage = lazy(() => import('./pages/dashboard/SessionDetailPage'))
const ResourceDetailPage = lazy(() => import('./pages/dashboard/ResourceDetailPage'))
const VendorDetailPage = lazy(() => import('./pages/dashboard/VendorDetailPage'))
const MessagesPage = lazy(() => import('./pages/dashboard/MessagesPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function LazyFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Routes>
        {/* Public Website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/resources" element={<ResourcesHubPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<BlogDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
        </Route>

        {/* Auth Pages (no layout wrapper) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard (Protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AcademyPage />} />
          <Route path="live-sessions" element={<LiveSessionsPage />} />
          <Route path="live-sessions/:id" element={<SessionDetailPage />} />
          <Route path="on-demand" element={<OnDemandPage />} />
          <Route path="on-demand/:id" element={<SessionDetailPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="resources/:id" element={<ResourceDetailPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="members/:id" element={<MemberProfilePage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="vendors/:id" element={<VendorDetailPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
          <Route path="my-jobs" element={<MyJobsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>
        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
