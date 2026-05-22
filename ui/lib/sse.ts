import type { SSEEvent, SSEEventData } from '@/types'

const SSE_EVENTS = [
  'planner_start', 'planner_done',
  'architect_start', 'architect_done',
  'coder_start', 'coder_file',
  'done', 'error',
] as const

export function connectSSE(
  jobId: string,
  apiUrl: string,
  onEvent: (event: SSEEvent) => void,
  onError: (error: Error) => void,
  onClose: () => void,
): () => void {
  const source = new EventSource(`${apiUrl}/api/generate/${jobId}/stream`)

  SSE_EVENTS.forEach(eventName => {
    source.addEventListener(eventName, (e: MessageEvent) => {
      let data: SSEEventData = {}
      try { data = JSON.parse(e.data) } catch { /* ignore malformed data */ }
      onEvent({ event: eventName, data })

      if (eventName === 'done' || eventName === 'error') {
        source.close()
        onClose()
      }
    })
  })

  source.onerror = () => {
    source.close()
    onError(new Error('Connection to agent stream failed'))
    onClose()
  }

  return () => source.close()
}
