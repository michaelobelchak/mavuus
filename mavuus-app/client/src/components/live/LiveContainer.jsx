// Mirrors Webflow's .padding-global (40px sides, 20px under 768px) + .container-large (max 1280px).
export default function LiveContainer({ as: Tag = 'div', className = '', innerClassName = '', children, ...props }) {
  return (
    <Tag className={`px-10 max-md:px-5 ${className}`} {...props}>
      <div className={`mx-auto w-full max-w-[1280px] ${innerClassName}`}>{children}</div>
    </Tag>
  )
}
