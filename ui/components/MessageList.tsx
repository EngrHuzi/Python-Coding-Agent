'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import type { Message } from '@/types'

const SUGGESTIONS = [
  { emoji: '⚡', text: 'CLI tool that converts CSV to JSON' },
  { emoji: '🌐', text: 'FastAPI REST API with CRUD endpoints' },
  { emoji: '🔍', text: 'Web scraper that extracts news headlines' },
  { emoji: '📊', text: 'Data pipeline that cleans CSV files' },
]

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-8 gap-6">
        {/* Logo area */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-xl" aria-hidden />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              PyCodingAgent
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-xs leading-relaxed">
              Describe any Python project and the AI team will plan, design, and build it for you.
            </p>
          </div>
        </div>

        {/* Pipeline badges */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {[
            { label: 'Planner',   color: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' },
            { label: 'Architect', color: 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20' },
            { label: 'Coder',     color: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' },
          ].map((step, i, arr) => (
            <span key={step.label} className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${step.color}`}>
                {step.label}
              </span>
              {i < arr.length - 1 && (
                <svg className="w-3.5 h-3.5 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </span>
          ))}
        </div>

        {/* Suggestions */}
        <div className="w-full max-w-md space-y-2" aria-label="Example prompts">
          <p className="text-xs font-medium text-slate-500 text-center mb-3 tracking-wide uppercase">Try an example</p>
          {SUGGESTIONS.map(s => (
            <div
              key={s.text}
              className="flex items-center gap-3 glass-card rounded-xl px-4 py-3 text-sm text-slate-300 hover:border-blue-500/30 hover:text-blue-300 hover:bg-blue-500/5 transition-all duration-150 cursor-default"
            >
              <span className="text-base shrink-0" aria-hidden>{s.emoji}</span>
              <span className="leading-snug">{s.text}</span>
            </div>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main
      className="flex-1 overflow-y-auto px-5 py-6 space-y-5"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
      <div ref={bottomRef} aria-hidden />
    </main>
  )
}
