export default function GradientText({ children, className = '', as: Tag = 'span' }) {
  return (
    <Tag className={`bg-gradient-to-r from-[#F26D92] to-[#1F648D] bg-clip-text text-transparent ${className}`}>
      {children}
    </Tag>
  )
}
