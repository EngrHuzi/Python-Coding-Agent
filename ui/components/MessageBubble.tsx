import { AgentProgress } from './AgentProgress'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  /* ── User ── */
  if (message.role === 'user') {
    return (
      <div className="flex justify-end animate-fade-up">
        <div className="max-w-[75%] bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed shadow-[0_4px_20px_rgba(59,130,246,0.25)]">
          {message.content}
        </div>
      </div>
    )
  }

  /* ── Assistant ── */
  return (
    <div className="flex items-start gap-3 animate-fade-up">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_16px_rgba(99,102,241,0.4)]">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>

      <div className="flex-1 max-w-[85%] space-y-1">
        <span className="text-xs font-medium text-slate-500 ml-1">PyCodingAgent</span>

        <div className="glass-card rounded-2xl rounded-tl-md overflow-hidden">
          {/* Agent steps */}
          {message.steps && (
            <div className="p-4">
              <AgentProgress steps={message.steps} status={message.status} />
            </div>
          )}

          {/* Success */}
          {message.status === 'done' && message.content && (
            <div className="px-4 py-3 border-t border-emerald-500/10 bg-emerald-500/5 flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-emerald-300">{message.content}</p>
            </div>
          )}

          {/* Error */}
          {message.status === 'error' && (
            <div className="px-4 py-3 border-t border-red-500/10 bg-red-500/5 flex items-start gap-2.5" role="alert">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-red-400">{message.errorMessage ?? 'Something went wrong. Please try again.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
