'use client'

import { useCallback, useRef, useState } from 'react'
import { MessageList } from './MessageList'
import { PromptInput } from './PromptInput'
import { FileTree } from './FileTree'
import { CodeViewer } from './CodeViewer'
import { startGenerate, getProjectFile, API_URL } from '@/lib/api'
import { connectSSE } from '@/lib/sse'
import type { AgentStep, FileNode, Message } from '@/types'

const INITIAL_STEPS: AgentStep[] = [
  { name: 'planner',   label: 'Planner',   status: 'pending', detail: 'Analyzing requirements' },
  { name: 'architect', label: 'Architect', status: 'pending', detail: 'Designing file structure' },
  { name: 'coder',     label: 'Coder',     status: 'pending', detail: 'Generating source code' },
]

export function ChatShell() {
  const [messages, setMessages]             = useState<Message[]>([])
  const [isStreaming, setIsStreaming]       = useState(false)
  const [selectedFile, setSelectedFile]    = useState<string | null>(null)
  const [fileContent, setFileContent]      = useState<string>('')
  const [activeProject, setActiveProject]  = useState<string | null>(null)
  const [activeFiles, setActiveFiles]      = useState<FileNode[]>([])
  const closeSSERef = useRef<(() => void) | null>(null)

  const updateMessage = useCallback((id: string, updater: (msg: Message) => Message) => {
    setMessages(prev => prev.map(m => m.id === id ? updater(m) : m))
  }, [])

  const handleSubmit = useCallback(async (prompt: string) => {
    if (isStreaming) return

    const userMsgId      = crypto.randomUUID()
    const assistantMsgId = crypto.randomUUID()

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: prompt, status: 'done' },
      { id: assistantMsgId, role: 'assistant', content: '', status: 'pending', steps: INITIAL_STEPS.map(s => ({ ...s })) },
    ])
    setIsStreaming(true)
    setSelectedFile(null)
    setFileContent('')
    setActiveProject(null)
    setActiveFiles([])

    try {
      const { jobId } = await startGenerate(prompt)

      const close = connectSSE(jobId, API_URL,
        ({ event: type, data }) => {
          if (type === 'planner_start') {
            updateMessage(assistantMsgId, msg => ({
              ...msg, status: 'streaming',
              steps: msg.steps!.map(s => s.name === 'planner' ? { ...s, status: 'running' } : s),
            }))
          } else if (type === 'planner_done') {
            updateMessage(assistantMsgId, msg => ({
              ...msg,
              steps: msg.steps!.map(s => s.name === 'planner'
                ? { ...s, status: 'done', detail: `${data.projectName} · ${data.features?.slice(0, 3).join(', ')}` }
                : s),
            }))
          } else if (type === 'architect_start') {
            updateMessage(assistantMsgId, msg => ({
              ...msg,
              steps: msg.steps!.map(s => s.name === 'architect' ? { ...s, status: 'running' } : s),
            }))
          } else if (type === 'architect_done') {
            updateMessage(assistantMsgId, msg => ({
              ...msg,
              steps: msg.steps!.map(s => s.name === 'architect'
                ? { ...s, status: 'done', detail: `${data.files?.length ?? 0} files planned` }
                : s),
            }))
          } else if (type === 'coder_start') {
            updateMessage(assistantMsgId, msg => ({
              ...msg,
              steps: msg.steps!.map(s => s.name === 'coder' ? { ...s, status: 'running', detail: 'Starting...' } : s),
            }))
          } else if (type === 'coder_file') {
            updateMessage(assistantMsgId, msg => ({
              ...msg,
              steps: msg.steps!.map(s => s.name === 'coder' ? { ...s, detail: `Writing ${data.file}` } : s),
            }))
          } else if (type === 'done') {
            const files: FileNode[] = (data.filesGenerated ?? []).map(p => ({ path: p }))
            setActiveProject(data.projectName ?? null)
            setActiveFiles(files)
            updateMessage(assistantMsgId, msg => ({
              ...msg, status: 'done',
              content: `${data.projectName} — ${data.totalFiles} files ready`,
              projectName: data.projectName,
              files,
              steps: msg.steps!.map(s => ({ ...s, status: 'done' })),
            }))
            setIsStreaming(false)
          } else if (type === 'error') {
            updateMessage(assistantMsgId, msg => ({
              ...msg, status: 'error',
              errorMessage: data.message ?? 'Generation failed',
              steps: msg.steps!.map(s => s.status === 'running' ? { ...s, status: 'error' } : s),
            }))
            setIsStreaming(false)
          }
        },
        (err) => {
          updateMessage(assistantMsgId, msg => ({ ...msg, status: 'error', errorMessage: err.message }))
          setIsStreaming(false)
        },
        () => setIsStreaming(false),
      )
      closeSSERef.current = close
    } catch (err) {
      updateMessage(assistantMsgId, msg => ({
        ...msg, status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
      }))
      setIsStreaming(false)
    }
  }, [isStreaming, updateMessage])

  const handleFileSelect = useCallback(async (filePath: string) => {
    if (!activeProject) return
    setSelectedFile(filePath)
    setFileContent('')
    try {
      const content = await getProjectFile(activeProject, filePath)
      setFileContent(content)
    } catch { setFileContent('# Failed to load file') }
  }, [activeProject])

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Chat column ──────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">

        {/* Header */}
        <header className="glass-panel flex items-center justify-between px-6 py-4 shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-xl bg-blue-500/25 blur-md" aria-hidden />
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-[0_0_14px_rgba(99,102,241,0.35)]">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent leading-none">
                PyCodingAgent
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">AI Python project generator</p>
            </div>
          </div>

          {/* Pipeline status */}
          <div className="flex items-center gap-1.5">
            {[
              { label: 'Planner',   color: 'bg-blue-500'    },
              { label: 'Architect', color: 'bg-violet-500'  },
              { label: 'Coder',     color: 'bg-emerald-500' },
            ].map((step, i, arr) => (
              <span key={step.label} className="flex items-center gap-1.5">
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? step.color + ' animate-pulse' : 'bg-white/15'}`} aria-hidden />
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">{step.label}</span>
                </span>
                {i < arr.length - 1 && <span className="text-white/10 text-[10px]">›</span>}
              </span>
            ))}
          </div>
        </header>

        {/* Messages */}
        <MessageList messages={messages} />

        {/* Input */}
        <div className="glass-panel border-t border-white/5 px-5 py-4 shrink-0">
          <div className="max-w-3xl mx-auto">
            <PromptInput onSubmit={handleSubmit} isStreaming={isStreaming} />
            <p className="text-center text-[11px] text-slate-600 mt-2.5">
              Powered by Gemini · OpenAI Agents SDK
            </p>
          </div>
        </div>
      </div>

      {/* ── File panel ───────────────────────────────────────── */}
      {activeFiles.length > 0 && (
        <aside
          className="w-72 border-l border-white/5 flex flex-col glass-panel shrink-0 animate-fade-in"
          aria-label="Generated project files"
        >
          {/* Panel header */}
          <div className="px-4 py-3.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center" aria-hidden>
                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-300">Project Files</p>
            </div>
            {activeProject && (
              <p className="text-[11px] text-slate-600 font-mono mt-1 truncate pl-7">
                {activeProject}/
              </p>
            )}
          </div>

          {/* File list */}
          <div
            className={selectedFile ? 'overflow-y-auto border-b border-white/5' : 'flex-1 overflow-y-auto'}
            style={selectedFile ? { maxHeight: '42%' } : undefined}
          >
            <FileTree
              files={activeFiles}
              selectedFile={selectedFile}
              onSelect={handleFileSelect}
            />
          </div>

          {/* Code viewer */}
          {selectedFile && (
            <div className="flex-1 overflow-hidden">
              {fileContent ? (
                <CodeViewer path={selectedFile} content={fileContent} />
              ) : (
                <div className="flex items-center justify-center h-full gap-2 text-slate-500">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-xs">Loading...</span>
                </div>
              )}
            </div>
          )}
        </aside>
      )}

    </div>
  )
}
