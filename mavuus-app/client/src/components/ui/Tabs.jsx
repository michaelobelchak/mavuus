// eslint-disable-next-line no-unused-vars -- motion is referenced as <motion.div> in JSX
import { motion } from 'motion/react'

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="border-b border-neutral-200">
      <nav className="flex gap-6 -mb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                relative pb-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap
                ${isActive ? 'text-brand-pink' : 'text-neutral-500 hover:text-dark-blue'}
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-brand-pink/10 text-brand-pink' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-brand-pink rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
