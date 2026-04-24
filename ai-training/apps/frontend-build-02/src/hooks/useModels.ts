import { useState, useEffect } from 'react'
import { ModelInfo } from '@/types/models'

export function useModels() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/models')
      .then(r => r.json())
      .then(d => {
        setModels(d.models)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { models, loading }
}
