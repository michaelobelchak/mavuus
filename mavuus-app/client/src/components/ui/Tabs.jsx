export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="border-b border-neutral-200">
      <nav className="flex gap-6 -mb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap
              ${activeTab === tab.id
                ? 'border-brand-pink text-brand-pink'
                : 'border-transparent text-neutral-500 hover:text-dark-blue hover:border-neutral-300'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-brand-pink/10 text-brand-pink' : 'bg-neutral-100 text-neutral-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
