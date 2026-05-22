'use client'

import type { FileNode } from '@/types'

const EXT_COLORS: Record<string, string> = {
  py:   'text-blue-400',
  toml: 'text-orange-400',
  md:   'text-slate-400',
  json: 'text-yellow-400',
  yaml: 'text-orange-300',
  yml:  'text-orange-300',
  txt:  'text-slate-500',
  sh:   'text-emerald-400',
}

function FileIcon({ path, active }: { path: string; active: boolean }) {
  const ext   = path.split('.').pop() ?? ''
  const color = active ? 'text-blue-300' : (EXT_COLORS[ext] ?? 'text-slate-500')
  return (
    <svg className={`w-3.5 h-3.5 shrink-0 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

interface FileTreeProps {
  files: FileNode[]
  selectedFile: string | null
  onSelect: (path: string) => void
}

export function FileTree({ files, selectedFile, onSelect }: FileTreeProps) {
  return (
    <nav aria-label="Generated project files" className="py-1.5 px-2">
      {files.map(file => {
        const active = selectedFile === file.path
        return (
          <button
            key={file.path}
            onClick={() => onSelect(file.path)}
            className={[
              'w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs',
              'transition-all duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
              'min-h-[34px] font-mono',
              active
                ? 'bg-blue-500/15 text-blue-300 border-l-2 border-blue-500 pl-[10px]'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent',
            ].join(' ')}
            aria-current={active ? 'true' : undefined}
          >
            <FileIcon path={file.path} active={active} />
            <span className="truncate">{file.path}</span>
          </button>
        )
      })}
    </nav>
  )
}
