import { Link } from 'react-router-dom'

const VARIANTS = {
  pink: 'bg-brand-pink text-white shadow-[0_18px_20px_-18px_#f26d92] hover:bg-brand-pink-hover',
  blue: 'bg-brand-blue text-white shadow-[0_18px_20px_-18px_#1f648d] hover:bg-brand-blue-hover',
  outline: 'border border-dark-blue bg-transparent text-dark-blue hover:border-brand-pink hover:text-brand-pink',
}

const SIZES = {
  md: 'px-8 py-4 text-base leading-6',
  sm: 'px-5 py-2.5 text-sm leading-5',
}

/**
 * The one button for the public site.
 * variant: pink (primary), blue (Sign Up and forms), outline (secondary). size: md | sm.
 * Renders a router Link for `to`, an <a> for `href`, or a <button> otherwise.
 */
export default function LiveButton({ to, href, variant = 'pink', size = 'md', fullOnMobile = true, className = '', children, ...props }) {
  const classes = [
    'inline-flex items-center justify-center gap-2.5 rounded-2xl text-center font-semibold no-underline',
    'transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-live)] active:translate-y-px',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    fullOnMobile ? 'max-md:w-full' : '',
    className,
  ].join(' ')

  if (href) return <a href={href} className={classes} {...props}>{children}</a>
  if (to) return <Link to={to} className={classes} {...props}>{children}</Link>
  return <button type="button" className={classes} {...props}>{children}</button>
}
