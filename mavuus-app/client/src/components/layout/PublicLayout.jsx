import { Outlet, useLocation } from 'react-router-dom'
import PublicHeader from './PublicHeader'
import Footer from './Footer'

export default function PublicLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <PublicHeader />
      <main className="flex-1">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
