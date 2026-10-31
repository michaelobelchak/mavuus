import { Link } from 'react-router-dom'

const VARIANTS = {
  pink: 'bg-brand-pink text-white shadow-[0_25px_20px_-20px_#f26d92] hover:bg-brand-pink-hover',
  blue: 'bg-brand-blue text-white shadow-[0_25px_20px_-20px_#1f648d] hover:bg-brand-blue-hover',
  secondary: 'border border-[#222] bg-transparent text-black hover:bg-black/5',
}

// Mirrors Webflow's .button: 16px radius, 16px 32px padding, weight 600, full width under 768px.
export default function LiveButton({ to, href, variant = 'pink', className = '', children, ...props }) {
  const classes = `inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-center text-base font-semibold leading-6 no-underline transition-all duration-300 max-md:w-full ${VARIANTS[variant]} ${className}`
  if (href) {
    return <a href={href} className={classes} {...props}>{children}</a>
  }
  return <Link to={to} className={classes} {...props}>{children}</Link>
}
