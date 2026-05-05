export function parseSSELine(line: string): { type: string; [key: string]: any } | null {
  if (!line.startsWith('data: ')) return null
  const dataString = line.slice(6)
  try {
    return JSON.parse(dataString)
  } catch (e) {
    return null
  }
}
