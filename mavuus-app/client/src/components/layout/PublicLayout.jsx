import PublicHeader from './PublicHeader'
import Footer from './Footer'
import PageTransition from '../ui/PageTransition'

export default function PublicLayout() {
  return (
    <div className="live-site flex min-h-screen flex-col overflow-x-clip">
      <PublicHeader />
      <main id="main-content" className="flex-1">
        <PageTransition />
      </main>
      <Footer />
    </div>
  )
}
