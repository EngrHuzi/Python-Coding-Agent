export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function startGenerate(prompt: string): Promise<{ jobId: string }> {
  const res = await fetch(`${API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail ?? 'Failed to start generation')
  }
  return res.json()
}

export async function getProjectFile(projectName: string, filePath: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/projects/${projectName}/files/${filePath}`)
  if (!res.ok) throw new Error('Failed to fetch file')
  const data = await res.json()
  return data.content as string
}
