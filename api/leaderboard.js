import { createServerSupabase } from './_lib/supabase.js'

const PAGE_SIZE = 500
const TOP_LIMIT = 5

function normalizeMetricValue(value) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0
}

function getGameState(saveData) {
  if (!saveData || typeof saveData !== 'object' || Array.isArray(saveData)) {
    return null
  }

  const payloadGame = saveData.payload?.game
  if (
    payloadGame &&
    typeof payloadGame === 'object' &&
    !Array.isArray(payloadGame)
  ) {
    return payloadGame
  }

  return saveData
}

function normalizePlayerName(value, index) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim().replace(/#0+$/, '')
  }

  return `Гость #${index + 1}`
}

function formatPlayerName(row, index) {
  if (typeof row.player_username === 'string' && row.player_username.trim()) {
    return normalizePlayerName(row.player_username, index)
  }

  if (
    typeof row.player_id === 'string' &&
    row.player_id.startsWith('discord:')
  ) {
    return `Discord ${row.player_id.slice('discord:'.length, 'discord:'.length + 6)}`
  }

  return `Гость #${index + 1}`
}

function buildMetricSnapshot(gameState) {
  if (!gameState || typeof gameState !== 'object') {
    return {
      shishki: 0,
      heavenlyShishki: 0,
      shards: 0,
      clicks: 0,
    }
  }

  const heavenlyShishki = normalizeMetricValue(
    gameState.totalHeavenlyShishkiEarned ?? gameState.heavenlyShishki,
  )

  return {
    shishki: normalizeMetricValue(
      gameState.lifetimeShishkiEarned ?? gameState.totalShishkiEarned,
    ),
    heavenlyShishki,
    shards: heavenlyShishki,
    clicks: normalizeMetricValue(gameState.manualClicks),
  }
}

function sortLeaderboardRows(rows, metricKey) {
  return [...rows]
    .filter((row) => row[metricKey] > 0)
    .sort((a, b) => {
      if (b[metricKey] !== a[metricKey]) {
        return b[metricKey] - a[metricKey]
      }

      return (
        (Date.parse(b.updatedAt ?? '') || 0) -
        (Date.parse(a.updatedAt ?? '') || 0)
      )
    })
    .slice(0, TOP_LIMIT)
}

function buildLeaderboards(rows) {
  const heavenlyShishki = sortLeaderboardRows(rows, 'heavenlyShishki')

  return {
    shishki: sortLeaderboardRows(rows, 'shishki'),
    heavenlyShishki,
    shards: heavenlyShishki,
    clicks: sortLeaderboardRows(rows, 'clicks'),
  }
}

async function loadLeaderboardRows(supabase) {
  const rows = []
  let from = 0

  while (true) {
    const to = from + PAGE_SIZE - 1
    const { data, error } = await supabase
      .from('player_saves')
      .select('player_id, player_username, save_data, updated_at')
      .range(from, to)

    if (error) {
      throw error
    }

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    rows.push(...data)

    if (data.length < PAGE_SIZE) {
      break
    }

    from += PAGE_SIZE
  }

  return rows
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      ok: false,
      error: 'method_not_allowed',
    })
  }

  try {
    const supabase = createServerSupabase()
    const rows = await loadLeaderboardRows(supabase)
    const normalizedRows = rows.map((row, index) => {
      const metrics = buildMetricSnapshot(getGameState(row.save_data))

      return {
        username: formatPlayerName(row, index),
        ...metrics,
        updatedAt: row.updated_at ?? null,
      }
    })
    const leaderboards = buildLeaderboards(normalizedRows)

    return res.status(200).json({
      ok: true,
      leaderboard: leaderboards.shishki,
      leaderboards,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'internal_error',
    })
  }
}
