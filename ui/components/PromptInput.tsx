'use client'

import { useCallback, useRef, useState } from 'react'

interface PromptInputProps {
  onSubmit: (prompt: string) => void
  isStreaming: boolean
}

export function PromptInput({ onSubmit, isStreaming }: PromptInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    onSubmit(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [value, isStreaming, onSubmit])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`
  }

  const canSubmit = value.trim().length > 0 && !isStreaming

  return (
    <div className={[
      'glass-card rounded-2xl transition-all duration-200',
      canSubmit
        ? 'ring-2 ring-blue-500/30 border-blue-500/20'
        : 'focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/15',
    ].join(' ')}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Describe the Python project you want to build..."
        disabled={isStreaming}
        rows={1}
        className="w-full bg-transparent px-4 pt-3.5 pb-2 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none leading-relaxed min-h-[48px] max-h-[180px] disabled:opacity-50"
        aria-label="Project description"
        spellCheck={false}
      />

      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <span className="text-xs text-slate-500">
          {isStreaming ? 'Generating your project...' : 'Ctrl+Enter to send'}
        </span>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label={isStreaming ? 'Generating...' : 'Generate project'}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
            canSubmit
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 active:scale-95 shadow-[0_4px_14px_rgba(59,130,246,0.35)] cursor-pointer'
              : 'bg-white/5 text-white/20 cursor-not-allowed',
          ].join(' ')}
        >
          {isStreaming ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Building...
            </>
          ) : (
            <>
              Generate
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
