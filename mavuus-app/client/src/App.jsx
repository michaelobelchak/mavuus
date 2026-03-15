import { Routes, Route } from 'react-router-dom'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Public Pages
import HomePage from './pages/public/HomePage'
import AboutPage from './pages/public/AboutPage'
import PricingPage from './pages/public/PricingPage'
import ContactPage from './pages/public/ContactPage'
import ResourcesHubPage from './pages/public/ResourcesHubPage'
import ArticlesPage from './pages/public/ArticlesPage'
import EventsPage from './pages/public/EventsPage'
import BlogDetailPage from './pages/public/BlogDetailPage'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Dashboard Pages
import AcademyPage from './pages/dashboard/AcademyPage'
import LiveSessionsPage from './pages/dashboard/LiveSessionsPage'
import OnDemandPage from './pages/dashboard/OnDemandPage'
import ResourcesPage from './pages/dashboard/ResourcesPage'
import MembersPage from './pages/dashboard/MembersPage'
import MemberProfilePage from './pages/dashboard/MemberProfilePage'
import VendorsPage from './pages/dashboard/VendorsPage'
import JobsPage from './pages/dashboard/JobsPage'
import JobDetailPage from './pages/dashboard/JobDetailPage'
import MyJobsPage from './pages/dashboard/MyJobsPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import MessagesPage from './pages/dashboard/MessagesPage'

export default function App() {
  return (
    <Routes>
      {/* Public Website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
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
        <Route path="on-demand" element={<OnDemandPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="members/:id" element={<MemberProfilePage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="my-jobs" element={<MyJobsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>
    </Routes>
  )
}
