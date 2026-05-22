export type AgentStepName = 'planner' | 'architect' | 'coder'
export type StepStatus = 'pending' | 'running' | 'done' | 'error'
export type MessageStatus = 'pending' | 'streaming' | 'done' | 'error'

export interface AgentStep {
  name: AgentStepName
  label: string
  status: StepStatus
  detail?: string
}

export interface FileNode {
  path: string
  purpose?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  status: MessageStatus
  steps?: AgentStep[]
  files?: FileNode[]
  projectName?: string
  errorMessage?: string
}

export interface ProjectManifest {
  projectName: string
  projectType: string
  pythonVersion: string
  features: string[]
  filesGenerated: string[]
}

export interface SSEEventData {
  projectName?: string
  projectType?: string
  features?: string[]
  description?: string
  files?: FileNode[]
  file?: string
  totalFiles?: number
  filesGenerated?: string[]
  message?: string
}

export interface SSEEvent {
  event: string
  data: SSEEventData
}
