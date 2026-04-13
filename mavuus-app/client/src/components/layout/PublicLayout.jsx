import PublicHeader from './PublicHeader'
import Footer from './Footer'
import PageTransition from '../ui/PageTransition'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <PublicHeader />
      <main className="flex-1">
        <PageTransition />
      </main>
      <Footer />
    </div>
  )
}
