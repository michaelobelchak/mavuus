// One type system for the public site. Sizes are desktop / tablet (<992px) / mobile (<768px).

// Hero and page-opening h1 on Persuade pages: 48 / 40 / 32
export const H_DISPLAY = 'text-5xl leading-[1.1] font-medium tracking-[-0.01em] text-dark-blue [text-wrap:balance] max-[991px]:text-[40px] max-[767px]:text-[32px]'

// h1 on Read pages (articles, legal, FAQ, resources): 40 / 32 / 28
export const H_PAGE = 'text-[40px] leading-[1.15] font-medium text-dark-blue [text-wrap:balance] max-[991px]:text-[32px] max-[767px]:text-[28px]'

// Section h2: 36 / 30 / 28
export const H_SECTION = 'text-4xl leading-[1.2] font-normal text-dark-blue [text-wrap:balance] max-[991px]:text-[30px] max-[767px]:text-[28px]'

// Card h3: 22 / 22 / 20
export const H_CARD = 'text-[22px] leading-[1.3] font-medium text-dark-blue max-[767px]:text-xl'

// Small heading inside cards and lists: 18
export const H_SMALL = 'text-lg leading-[1.4] font-semibold text-dark-blue'

// Lead paragraph under a section heading: 20 / 18
export const LEAD = 'text-xl leading-[1.6] text-live-grey max-[767px]:text-lg'

// Body copy: 16, 1.8
export const BODY = 'text-base leading-[1.8] text-live-grey'

// Section stack: eyebrow, heading, lead, with the same gaps everywhere
export const SECTION_HEAD = 'flex max-w-[736px] flex-col gap-4'

export function Highlight({ children }) {
  return <span className="font-semibold text-brand-blue">{children}</span>
}

// The pink label above a section heading. One size everywhere.
export function Eyebrow({ as: Tag = 'p', className = '', children }) {
  return (
    <Tag className={`m-0 text-base leading-6 font-medium tracking-[1px] text-brand-pink uppercase max-[767px]:text-sm ${className}`}>
      {children}
    </Tag>
  )
}

// Small grey caption (stat captions, scale ends, card meta)
export function Label({ as: Tag = 'span', className = '', children }) {
  return (
    <Tag className={`text-[13px] leading-5 font-semibold tracking-[0.08em] text-live-muted uppercase ${className}`}>
      {children}
    </Tag>
  )
}
