import type { AgentStep, AgentStepName, MessageStatus } from '@/types'

const STEP_META: Record<AgentStepName, {
  label: string
  description: string
  icon: React.ReactNode
  glow: string
  ring: string
  text: string
  badge: string
  connector: string
}> = {
  planner: {
    label: 'Planning',
    description: 'Understanding your requirements',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    glow:      'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]',
    ring:      'ring-blue-500/30',
    text:      'text-blue-400',
    badge:     'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
    connector: 'bg-blue-500/20',
  },
  architect: {
    label: 'Designing',
    description: 'Designing the file structure',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    glow:      'bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]',
    ring:      'ring-violet-500/30',
    text:      'text-violet-400',
    badge:     'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20',
    connector: 'bg-violet-500/20',
  },
  coder: {
    label: 'Coding',
    description: 'Writing the source code',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    glow:      'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    ring:      'ring-emerald-500/30',
    text:      'text-emerald-400',
    badge:     'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
    connector: 'bg-emerald-500/20',
  },
}

function StepIcon({ step }: { step: AgentStep }) {
  const meta = STEP_META[step.name]

  if (step.status === 'pending') {
    return (
      <div className="w-8 h-8 rounded-full bg-white/5 ring-2 ring-white/10 flex items-center justify-center text-white/20 shrink-0">
        {meta.icon}
      </div>
    )
  }
  if (step.status === 'running') {
    return (
      <div className={`w-8 h-8 rounded-full bg-white/5 ring-2 ${meta.ring} flex items-center justify-center ${meta.text} shrink-0`}>
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }
  if (step.status === 'done') {
    return (
      <div className={`w-8 h-8 rounded-full ${meta.glow} flex items-center justify-center text-white shrink-0`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-red-500/10 ring-2 ring-red-500/30 flex items-center justify-center text-red-400 shrink-0">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  )
}

interface AgentProgressProps {
  steps: AgentStep[]
  status: MessageStatus
}

export function AgentProgress({ steps }: AgentProgressProps) {
  return (
    <div role="status" aria-label="Agent pipeline progress" className="space-y-3">
      {steps.map((step, i) => {
        const meta = STEP_META[step.name]
        const isActive = step.status === 'running' || step.status === 'done'

        return (
          <div key={step.name} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <StepIcon step={step} />
              {i < steps.length - 1 && (
                <div className={`w-px mt-1 h-4 ${step.status === 'done' ? meta.connector : 'bg-white/5'}`} />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${
                  step.status === 'pending' ? 'text-white/25' :
                  step.status === 'running' ? meta.text :
                  step.status === 'done'    ? 'text-slate-200' :
                  'text-red-400'
                }`}>
                  {meta.label}
                </span>

                {step.status === 'running' && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${meta.badge}`}>
                    In progress
                  </span>
                )}
                {step.status === 'done' && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                    Done
                  </span>
                )}
              </div>

              <p className={`text-xs mt-0.5 leading-relaxed ${isActive ? 'text-slate-400' : 'text-white/20'}`}>
                {step.detail && isActive ? step.detail : meta.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
