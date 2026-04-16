const CLOUD_SAVE_TIMEOUT_MS = 12000

async function fetchWithTimeout(
  url,
  options = {},
  timeoutMs = CLOUD_SAVE_TIMEOUT_MS,
) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(
    () => controller.abort('timeout'),
    timeoutMs,
  )

  try {
    return await fetch(url, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Cloud request timed out')
    }

    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export async function initializeCloudSession() {
  const response = await fetchWithTimeout('/api/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Cloud session init failed: ${text}`)
  }

  return response.json()
}

export async function uploadCloudSave({
  appVersion,
  save,
  expectedVersion = null,
  force = false,
}) {
  const response = await fetchWithTimeout('/api/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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

export async function downloadCloudSave() {
  const response = await fetchWithTimeout('/api/load')

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Cloud load failed: ${text}`)
  }

  return response.json()
}
