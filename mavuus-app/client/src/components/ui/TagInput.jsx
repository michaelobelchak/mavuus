import { useState, useRef } from 'react'
import { X, Plus } from 'lucide-react'

export default function TagInput({ tags = [], onAdd, onRemove, placeholder = 'Add a tag...', suggestions = [], maxTags = 20 }) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  ).slice(0, 5)

  const handleAdd = (tag) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onAdd(trimmed)
      setInput('')
      setShowSuggestions(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1])
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-3 border border-neutral-200 rounded-xl focus-within:ring-2 focus-within:ring-brand-pink/30 focus-within:border-brand-pink min-h-[44px]">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-brand-pink/10 text-brand-pink rounded-full text-xs font-medium">
            {tag}
            <button onClick={() => onRemove(tag)} className="hover:text-brand-pink-hover cursor-pointer">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] text-sm bg-transparent outline-none placeholder:text-neutral-400"
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="mt-1 border border-neutral-200 rounded-xl bg-white shadow-lg overflow-hidden">
          {filteredSuggestions.map(s => (
            <button
              key={s}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleAdd(s)}
              className="w-full text-left px-4 py-2 text-sm text-dark-blue hover:bg-neutral-50 cursor-pointer flex items-center gap-2"
            >
              <Plus size={14} className="text-neutral-400" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
