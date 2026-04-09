export const STARTING_STATE = {
  shishki: 0,
  money: 25,
  knowledge: 0,
  clickPower: 1,
  shishkiPerSecond: 0,
  moneyPerSecond: 1,
  aiPower: 0,
  manualClicks: 0,
  totalShishkiEarned: 0,
  totalMoneyEarned: 25,
  subscriptions: {
    gigachat: 0,
    gpt: 0,
    claude: 0,
  },
  upgrades: {
    textbooks: 0,
    coffee: 0,
    internship: 0,
    promptEngineering: 0,
  },
}

export const SUBSCRIPTIONS = [
  {
    id: 'gigachat',
    title: 'Гига чат',
    description: 'Минимальный минимум. Самый дерьмовый AI. Автоматически фармит шишки.',
    baseCost: 35,
    costScale: 1.55,
    effectLabel: '+2 шишки/сек',
    apply(state) {
      state.aiPower += 1
      state.shishkiPerSecond += 2
      state.knowledge += 1
    },
  },
  {
    id: 'gpt',
    title: 'Чат ГПТ помоги',
    description: 'База. Ускоряет интеллект и дает солидную добычу.',
    baseCost: 120,
    costScale: 1.75,
    effectLabel: '+8 шишек/сек',
    apply(state) {
      state.aiPower += 3
      state.shishkiPerSecond += 8
      state.knowledge += 3
    },
  },
  {
    id: 'claude',
    title: 'Клоуд АИ',
    description: 'Мягко пишет, сильно майнит. Для серьезной учебы.',
    baseCost: 260,
    costScale: 1.9,
    effectLabel: '+20 шишек/сек',
    apply(state) {
      state.aiPower += 6
      state.shishkiPerSecond += 20
      state.knowledge += 5
    },
  },
]

export const UPGRADES = [
  {
    id: 'textbooks',
    title: 'Учебники и методички',
    description: 'Повышают ценность каждого ручного клика.',
    currency: 'money',
    baseCost: 20,
    costScale: 1.5,
    effectLabel: '+1 к клику',
    apply(state) {
      state.clickPower += 1
      state.knowledge += 1
    },
  },
  {
    id: 'coffee',
    title: 'Кофе и дедлайны',
    description: 'Студенческая химия. Немного больше шишек в секунду.',
    currency: 'money',
    baseCost: 45,
    costScale: 1.65,
    effectLabel: '+1 шишка/сек',
    apply(state) {
      state.shishkiPerSecond += 1
    },
  },
  {
    id: 'internship',
    title: 'Работа на складе OZON',
    description: 'Дает стабильный денежный поток на новые подписки.',
    currency: 'shishki',
    baseCost: 80,
    costScale: 1.7,
    effectLabel: '+2 денег/сек',
    apply(state) {
      state.moneyPerSecond += 2
      state.knowledge += 2
    },
  },
  {
    id: 'promptEngineering',
    title: 'Промпт-инжиниринг',
    description: 'Усиливает все AI-подписки через знания.',
    currency: 'shishki',
    baseCost: 140,
    costScale: 1.85,
    effectLabel: '+10% к AI-добыче',
    apply(state) {
      state.knowledge += 4
      state.shishkiPerSecond += Math.max(1, Math.floor(state.aiPower * 0.1 * 4))
    },
  },
]

export function getScaledCost(baseCost, costScale, level) {
  return Math.floor(baseCost * Math.pow(costScale, level))
}
