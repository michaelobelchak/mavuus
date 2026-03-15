/**
 * MAVUUS COMPONENT LIBRARY
 * ========================
 *
 * Centralized export file for all reusable components.
 * Import from here for clean, documented access:
 *
 *   import { Button, Card, AnimatedSection, LogoBar } from '../components'
 *
 * ─────────────────────────────────────────────
 * UI COMPONENTS (Atomic / Base)
 * ─────────────────────────────────────────────
 */

// Button - Primary CTA and action buttons
// Variants: default (pink), secondary (outlined), outline, ghost
// Sizes: sm, md, lg
// Usage: <Button variant="secondary" size="lg">Click me</Button>
export { default as Button } from './ui/Button'

// Card - Container with rounded corners and shadow
// Usage: <Card className="p-6">Content here</Card>
export { default as Card } from './ui/Card'

// Input & Textarea - Form inputs with labels
// Usage: <Input label="Name" placeholder="Your name" required />
export { default as Input } from './ui/Input'
export { Textarea } from './ui/Input'

// Avatar - User profile image with fallback
// Usage: <Avatar src="/img.jpg" name="Jane" size="lg" />
export { default as Avatar } from './ui/Avatar'

// Badge - Small colored labels
// Variants: default, success, warning, danger
// Usage: <Badge variant="success">Active</Badge>
export { default as Badge } from './ui/Badge'

// Accordion - Expandable content panels (generic)
// Usage: <Accordion items={[{ title, content }]} />
export { default as Accordion } from './ui/Accordion'

// AnimatedSection - Scroll-triggered reveal animation wrapper
// Animations: fade-up, fade-down, fade-left, fade-right, scale-up, fade
// Usage: <AnimatedSection animation="fade-up" delay={200}>Content</AnimatedSection>
export { default as AnimatedSection } from './ui/AnimatedSection'

// Breadcrumbs - Navigation breadcrumb trail
// Props: items (array of {label, path?})
// Usage: <Breadcrumbs items={[{label:'Home',path:'/'},{label:'Articles'}]} />
export { default as Breadcrumbs } from './ui/Breadcrumbs'

// Modal - Reusable dialog overlay with portal rendering
// Props: isOpen, onClose, title, children, size (sm/md/lg/xl), showClose
// Usage: <Modal isOpen={open} onClose={() => setOpen(false)} title="Edit">Content</Modal>
export { default as Modal } from './ui/Modal'

// Tabs - Horizontal tab navigation with underline indicator
// Props: tabs (array of {id, label, count?}), activeTab, onChange
// Usage: <Tabs tabs={[{id:'all',label:'All'}]} activeTab="all" onChange={setTab} />
export { default as Tabs } from './ui/Tabs'

// Toast - Notification system (context provider + hook)
// Variants: success, error, info — auto-dismiss after 4s
// Usage: wrap app in <ToastProvider>, then const toast = useToast(); toast.success('Done!')
export { ToastProvider, useToast } from './ui/Toast'

// EmptyState - Placeholder for empty content areas
// Props: icon (Lucide component), title, message, action (ReactNode)
// Usage: <EmptyState icon={Inbox} title="No messages" message="Check back later" />
export { default as EmptyState } from './ui/EmptyState'

// Toggle - On/off switch with label and description
// Props: checked, onChange, label, description
// Usage: <Toggle checked={on} onChange={setOn} label="Email notifications" />
export { default as Toggle } from './ui/Toggle'

// Select - Styled dropdown select with label/error support
// Props: label, error, options (string[] or {value,label}[]), placeholder, ...native
// Usage: <Select label="Role" options={['Admin','Member']} placeholder="Choose..." />
export { default as Select } from './ui/Select'

// TagInput - Multi-tag input with autocomplete suggestions
// Props: tags, onAdd, onRemove, placeholder, suggestions, maxTags
// Usage: <TagInput tags={tags} onAdd={add} onRemove={remove} suggestions={['React','Vue']} />
export { default as TagInput } from './ui/TagInput'

// ConfirmDialog - Confirmation modal built on Modal + Button
// Props: isOpen, onClose, onConfirm, title, message, confirmText, confirmVariant, loading
// Usage: <ConfirmDialog isOpen={show} onClose={close} onConfirm={del} title="Delete?" message="..." />
export { default as ConfirmDialog } from './ui/ConfirmDialog'


/**
 * ─────────────────────────────────────────────
 * SECTION COMPONENTS (Shared Page Sections)
 * ─────────────────────────────────────────────
 */

// LogoBar - Trusted brands logo strip
// Props: title (string)
// Used on: About, Pricing, Contact, Homepage
export { default as LogoBar } from './sections/LogoBar'

// TestimonialRow - "Forming Lasting Partnerships" testimonial
// Used on: About, Pricing, Contact, Homepage
export { default as TestimonialRow } from './sections/TestimonialRow'

// CTABannerQuote - Light blue CTA banner with quote + person image
// Used on: About, Pricing, Contact, Homepage
export { default as CTABannerQuote } from './sections/CTABannerQuote'

// InfiniteLeaderScroll - Auto-scrolling horizontal leader cards
// Props: leaders (array), speed (number, px/s)
// Used on: Homepage
export { default as InfiniteLeaderScroll } from './sections/InfiniteLeaderScroll'

// FAQSection - Figma-styled accordion FAQ with pink borders
// Props: items (array), heading (string)
// Used on: Contact
export { default as FAQSection } from './sections/FAQSection'


/**
 * ─────────────────────────────────────────────
 * LAYOUT COMPONENTS
 * ─────────────────────────────────────────────
 */

// PublicLayout - Header + Outlet + Footer wrapper for public pages
export { default as PublicLayout } from './layout/PublicLayout'

// DashboardLayout - Sidebar + Outlet for authenticated dashboard
export { default as DashboardLayout } from './layout/DashboardLayout'

// DashboardSidebar - Left sidebar navigation for dashboard
export { default as DashboardSidebar } from './layout/DashboardSidebar'


/**
 * ─────────────────────────────────────────────
 * HOOKS
 * ─────────────────────────────────────────────
 */

// useScrollReveal - Intersection Observer for scroll-triggered animations
// Returns: { ref, isVisible }
// Options: { threshold, rootMargin, once }
export { default as useScrollReveal } from '../hooks/useScrollReveal'
