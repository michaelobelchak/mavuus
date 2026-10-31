export function Eyebrow({ as: Tag = 'div', className = '', children }) {
  return (
    <Tag className={`text-[clamp(16px,2vw,20px)] leading-[26px] font-medium tracking-[1px] text-brand-pink uppercase ${className}`}>
      {children}
    </Tag>
  )
}

export function Highlight({ children }) {
  return <span className="font-bold text-brand-blue">{children}</span>
}

export const H2_CLASS =
  'text-[28px] leading-[1.2] font-normal text-balance text-dark-blue max-[991px]:text-[clamp(25px,5vw,48px)] max-[767px]:text-[32px]'

export const LABEL_CLASS = 'text-[12.8px] leading-[19.2px] font-semibold tracking-[1px] text-[#6b7280] uppercase'

export function CheckItem({ children }) {
  return (
    <li className="relative mb-1 pl-[25.6px] text-[15.2px] leading-[1.5] text-dark-blue">
      <span
        aria-hidden="true"
        className="absolute top-[0.28em] left-0 flex size-[16.8px] items-center justify-center rounded-full bg-[#f06f9a]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="size-[9.92px]">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      {children}
    </li>
  )
}
