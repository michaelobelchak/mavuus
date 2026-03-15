export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <Icon size={28} className="text-neutral-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-dark-blue mb-2">{title}</h3>
      {message && <p className="text-sm text-neutral-500 max-w-md mb-6">{message}</p>}
      {action && action}
    </div>
  )
}
