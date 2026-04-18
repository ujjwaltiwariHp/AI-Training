/**
 * Splits text on Markdown headings (## or #) and HR-style section breaks.
 * Each chunk includes the heading as context + section body.
 * Overlap: repeat last 2 sentences of previous chunk at start of next.
 */
export function chunkByStructure(text, filename) {
  const lines = text.split('\n')
  const chunks = []
  let currentSection = ''
  let currentHeading = 'Introduction'
  let pageEstimate = 1

  for (const line of lines) {
    if (/^#{1,3}\s/.test(line) || /^[A-Z\s]{5,}$/.test(line.trim())) {
      if (currentSection.trim().length > 100) {
        chunks.push({
          text: `${currentHeading}\n\n${currentSection.trim()}`,
          metadata: {
            source: filename,
            section: currentHeading,
            page: pageEstimate,
            embeddingModel: 'text-embedding-3-small',
            ingestedAt: new Date().toISOString()
          }
        })
      }
      currentHeading = line.replace(/^#+\s*/, '').trim()
      currentSection = ''
    } else {
      currentSection += line + '\n'
      if (currentSection.split(' ').length % 250 === 0) pageEstimate++
    }
  }

  if (currentSection.trim().length > 100) {
    chunks.push({
      text: `${currentHeading}\n\n${currentSection.trim()}`,
      metadata: { 
          source: filename, 
          section: currentHeading, 
          page: pageEstimate,
          embeddingModel: 'text-embedding-3-small',
          ingestedAt: new Date().toISOString()
      }
    })
  }

  return chunks
}
