function trimTrailingDiscordZero(value) {
  return String(value ?? '')
    .replace(/#0+$/, '')
    .trim()
}

export function getPreferredDiscordName(user) {
  if (!user || typeof user !== 'object') {
    return 'unknown'
  }

  const candidates = [
    user.global_name,
    user.globalName,
    user.display_name,
    user.displayName,
    user.username,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return trimTrailingDiscordZero(candidate)
    }
  }

  return 'unknown'
}

export function normalizePlayerName(value, fallback = 'Гость') {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback
  }

  return trimTrailingDiscordZero(value)
}
