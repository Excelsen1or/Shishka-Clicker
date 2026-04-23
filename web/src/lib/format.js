const formatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const smallFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
})
const fullFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
})

const NUMBER_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'QD', 'QN', 'SX', 'SP']

export function formatNumber(number) {
  if (!Number.isFinite(number)) return String(number)

  if (Math.abs(number) < 1) return smallFormatter.format(number)
  if (number < 1000) return formatter.format(number)

  let k = 1000
  let i = 0

  while (number >= k) {
    number /= k
    i++
  }

  let sym

  if (i > 8) {
    const zeros = i * 3
    sym = `e${zeros}`
  } else {
    sym = NUMBER_SUFFIXES[i]
  }

  const shortNumber = formatter.format(number)
  return `${shortNumber}${sym}`
}

export function formatFullNumber(number) {
  if (!Number.isFinite(number)) return String(number)
  return fullFormatter.format(number)
}

function normalizeDurationSeconds(value) {
  const parsed = Number(value ?? 0)

  if (!Number.isFinite(parsed)) {
    return 0
  }

  return Math.max(0, Math.floor(parsed))
}

export function formatDurationCompact(totalSeconds) {
  const seconds = normalizeDurationSeconds(totalSeconds)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  }

  if (minutes > 0) {
    return `${minutes}м ${remainingSeconds}с`
  }

  return `${remainingSeconds}с`
}

export function formatDurationDetailed(totalSeconds) {
  const seconds = normalizeDurationSeconds(totalSeconds)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days} д ${hours} ч`
  }

  if (hours > 0) {
    return `${hours} ч ${minutes} м`
  }

  return `${minutes} м`
}

export function isNumberAbbreviated(formattedValue) {
  // Check if the formatted value has a suffix (K, M, B, T, QD, QN, SX, SP, e...)
  return /[KMBTQDQNSXspe]$/.test(String(formattedValue))
}
