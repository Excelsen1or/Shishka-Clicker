export async function uploadCloudSave({ playerId, appVersion, save, expectedVersion = null, force = false }) {
  const response = await fetch('/api/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      playerId,
      appVersion,
      save,
      expectedVersion,
      force,
    }),
    keepalive: true,
  })

  if (response.status === 409) {
    const payload = await response.json()
    const error = new Error('Cloud save conflict')
    error.code = 'cloud_conflict'
    error.current = payload.current ?? null
    throw error
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Cloud save failed: ${text}`)
  }

  return response.json()
}

export async function downloadCloudSave(playerId) {
  const response = await fetch(`/api/load?playerId=${encodeURIComponent(playerId)}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Cloud load failed: ${text}`)
  }

  return response.json()
}
