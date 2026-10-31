import { Link } from 'react-router-dom'

// Webflow .eyebrow. In block flow it sits inline inside a wrapper, like on live.
export function Eyebrow({ className = '', children }) {
  return (
    <div className={className}>
      <span className="text-[clamp(16px,2vw,20px)] font-medium uppercase leading-[26px] tracking-[1px] text-brand-pink">
        {children}
      </span>
    </div>
  )
}

export function Highlight({ children }) {
  return <span className="font-bold text-brand-blue">{children}</span>
}

// Webflow .heading-style-h2 (28px, 32px under 768px)
export const H2 = 'w-full text-[28px] font-normal leading-[1.2] [text-wrap:balance] max-[767px]:text-[32px]'

// Webflow .text-size-regular paragraph
export const BODY = 'text-base leading-[28.8px] text-live-grey'

// Webflow .v3-why_chip / .v3-net_card
export const CARD =
  'rounded-2xl border border-black/[0.06] border-l-4 border-l-[#f06f9a] bg-white shadow-[0_12px_32px_rgba(17,24,39,0.06)] transition-[transform,box-shadow] duration-[400ms] ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-[5px] hover:shadow-[0_22px_46px_rgba(240,111,154,0.16)]'

// Webflow .button.is-outline
export function OutlineButton({ to, className = '', children }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2.5 rounded-2xl border border-black bg-transparent px-8 py-4 text-center text-base font-semibold leading-6 text-black no-underline transition-all duration-300 hover:border-brand-pink hover:text-brand-pink hover:shadow-[0_0_5px_#f26d92,0_5px_25px_-20px_#00000085] max-[767px]:w-full ${className}`}
    >
      {children}
    </Link>
  )
}
