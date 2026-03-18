import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import AdminRoute from './components/layout/AdminRoute'
import ErrorBoundary from './components/ErrorBoundary'

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
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import AuthCallbackPage from './pages/auth/AuthCallbackPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'

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
const InvitePage = lazy(() => import('./pages/dashboard/InvitePage'))
const SpeakersPage = lazy(() => import('./pages/dashboard/SpeakersPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Admin Pages (lazy)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminUserDetailPage = lazy(() => import('./pages/admin/AdminUserDetailPage'))
const AdminSessionsPage = lazy(() => import('./pages/admin/AdminSessionsPage'))
const AdminResourcesPage = lazy(() => import('./pages/admin/AdminResourcesPage'))
const AdminSpeakersPage = lazy(() => import('./pages/admin/AdminSpeakersPage'))
const AdminVendorsPage = lazy(() => import('./pages/admin/AdminVendorsPage'))
const AdminJobsPage = lazy(() => import('./pages/admin/AdminJobsPage'))
const AdminCommentsPage = lazy(() => import('./pages/admin/AdminCommentsPage'))
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'))
const AdminRecommendationsPage = lazy(() => import('./pages/admin/AdminRecommendationsPage'))
const AdminContactPage = lazy(() => import('./pages/admin/AdminContactPage'))
const AdminSiteContentPage = lazy(() => import('./pages/admin/AdminSiteContentPage'))
const AdminTestimonialsPage = lazy(() => import('./pages/admin/AdminTestimonialsPage'))
const AdminBrandLogosPage = lazy(() => import('./pages/admin/AdminBrandLogosPage'))
const AdminFaqPage = lazy(() => import('./pages/admin/AdminFaqPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage'))
const AdminReferralsPage = lazy(() => import('./pages/admin/AdminReferralsPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminExportsPage = lazy(() => import('./pages/admin/AdminExportsPage'))
const AdminConnectionsPage = lazy(() => import('./pages/admin/AdminConnectionsPage'))
const AdminAuditLogPage = lazy(() => import('./pages/admin/AdminAuditLogPage'))

function LazyFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
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
          <Route path="/events" element={<EventsPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
        </Route>

        {/* Auth Pages (no layout wrapper) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

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
          <Route path="invite" element={<InvitePage />} />
          <Route path="speakers" element={<SpeakersPage />} />
        </Route>
        {/* Admin Panel (Protected + Admin Only) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:id" element={<AdminUserDetailPage />} />
          <Route path="connections" element={<AdminConnectionsPage />} />
          <Route path="sessions" element={<AdminSessionsPage />} />
          <Route path="resources" element={<AdminResourcesPage />} />
          <Route path="speakers" element={<AdminSpeakersPage />} />
          <Route path="vendors" element={<AdminVendorsPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="comments" element={<AdminCommentsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="recommendations" element={<AdminRecommendationsPage />} />
          <Route path="contact" element={<AdminContactPage />} />
          <Route path="site-content" element={<AdminSiteContentPage />} />
          <Route path="testimonials" element={<AdminTestimonialsPage />} />
          <Route path="brand-logos" element={<AdminBrandLogosPage />} />
          <Route path="faq" element={<AdminFaqPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="referrals" element={<AdminReferralsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="exports" element={<AdminExportsPage />} />
          <Route path="audit-log" element={<AdminAuditLogPage />} />
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  )
}
