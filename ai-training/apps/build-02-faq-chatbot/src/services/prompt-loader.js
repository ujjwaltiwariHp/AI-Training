import { readFile } from 'fs/promises'
import { join } from 'path'

const cache = new Map()

export async function loadPrompt(name, variables = {}) {
  if (!cache.has(name)) {
    const filePath = join(process.cwd(), 'src/prompts', `${name}.md`)
    const template = await readFile(filePath, 'utf-8')
    cache.set(name, template)
  }

  let prompt = cache.get(name)
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replaceAll(`{{${key}}}`, value)
  }
  return prompt
}
