const PLAYER_ID_KEY = 'shishka_player_id'

function buildDiscordPlayerId(discordUserId) {
  return `discord:${String(discordUserId)}`
}

function getOrCreatePlayerId() {
  if (typeof window === 'undefined') {
    return null
  }

  let playerId = window.localStorage.getItem(PLAYER_ID_KEY)

  if (!playerId) {
    playerId = crypto.randomUUID()
    window.localStorage.setItem(PLAYER_ID_KEY, playerId)
  }

  return playerId
}

export function resolvePlayerId(discordUserId) {
  return discordUserId ? buildDiscordPlayerId(discordUserId) : getOrCreatePlayerId()
}
