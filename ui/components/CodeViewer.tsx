'use client'

import { useState } from 'react'

interface CodeViewerProps {
  path: string
  content: string
}

export function CodeViewer({ path, content }: CodeViewerProps) {
  const [copied, setCopied] = useState(false)
  const lines = content.split('\n')
  const ext   = path.split('.').pop() ?? ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#1E1E2E]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#181825] border-b border-white/5 shrink-0">
        <div className="flex gap-1.5" aria-hidden>
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28CA41]" />
        </div>
        <span className="text-[#CDD6F4]/60 text-xs font-mono flex-1 truncate ml-1">{path}</span>
        <span className="text-[#CDD6F4]/30 text-[10px] font-mono uppercase shrink-0">{ext}</span>
        <button
          onClick={handleCopy}
          className={[
            'shrink-0 flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md transition-all duration-150',
            'focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400',
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white/5 text-[#CDD6F4]/50 hover:bg-white/10 hover:text-[#CDD6F4]',
          ].join(' ')}
          aria-label="Copy file content"
        >
          {copied ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Lines */}
      <div className="overflow-auto flex-1">
        <pre className="text-[12px] font-mono leading-[1.7] py-4 min-w-max" tabIndex={0}>
          {lines.map((line, i) => (
            <div key={i} className="flex hover:bg-white/[0.03] px-4">
              <span className="text-[#45475A] select-none w-10 shrink-0 text-right pr-5 tabular-nums text-[11px]" aria-hidden>
                {i + 1}
              </span>
              <span className="text-[#CDD6F4] whitespace-pre">{line || ' '}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
