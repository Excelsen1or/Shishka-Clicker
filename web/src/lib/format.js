const formatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

export function formatNumber(value) {
  return formatter.format(value)
}
