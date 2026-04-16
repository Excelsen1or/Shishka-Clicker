const formatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const fullFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
})

const NUMBER_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'QD', 'QN', 'SX', 'SP']

export function formatNumber(number) {
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

export function isNumberAbbreviated(formattedValue) {
  // Check if the formatted value has a suffix (K, M, B, T, QD, QN, SX, SP, e...)
  return /[KMBTQDQNSXspe]$/.test(String(formattedValue))
}
