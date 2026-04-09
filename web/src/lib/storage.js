const SAVE_KEY = 'shishka-clicker-save-v2'

export function loadGame() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn('Failed to load save:', error)
    return null
  }
}

export function saveGame(state) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Failed to save game:', error)
  }
}

export function clearGame() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SAVE_KEY)
}
