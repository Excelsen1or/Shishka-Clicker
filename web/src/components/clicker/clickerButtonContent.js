export const TAP_SPEED_WINDOW = 2000
export const IDLE_TIMEOUT = 4500

export const VISUAL_DURATIONS = {
  tap: 240,
  mega: 680,
  prism: 1300,
}

export const TAP_SPEED_TIERS = [
  {
    minTps: 0,
    labels: [
      'Че так медленно',
      'Давай, тапай побыстрее',
      'Расход: 150 шишечек',
      'Хомяк отдыхает',
    ],
  },
  {
    minTps: 2,
    labels: ['Неплохо!', 'Разгоняемся...', 'КЛИК = ПРОФИТ', 'Так держать!'],
  },
  {
    minTps: 4,
    labels: [
      'ЖМИИИИ!!!!',
      'Тапай, пока шишка горячая',
      'Тапай, тапай этого хомячка',
      'Ахахахах - Лисимп',
      'Пишу Default Squad',
      'Среднестатистический',
    ],
  },
  {
    minTps: 7,
    labels: [
      'ЕБАНУТЫЙ РАЗГОН НАХУЙ',
      'ЕБАТЬ ТЫ ЖМЯКАЕШЬ',
      'ЧУВАААААК',
      'МАШИНА КЛИКОВ!!!',
    ],
  },
  {
    minTps: 11,
    labels: [
      'АВТОКЛИКЕР?!',
      'ТЫ ВООБЩЕ ЧЕЛОВЕК?!',
      'НЕРЕАЛЬНАЯ СКОРОСТЬ',
      'БОГА ТАПА ПРИЗВАЛИ',
    ],
  },
]

export const IDLE_LABELS = [
  'Ты чо уснул?',
  'Тапать будем, нет?',
  'Всё да?',
  'Блади мышка имба',
  'Шишки сами себя не натапают',
  'Эй, ты тут?',
]

export const GREETING_LABELS = [
  'Ты в эдите братан!',
  'Да ну, неужели та самая легенда вернулась?',
]

export const RETURN_LABELS = {
  subscriptions: [
    'Всё прокачал?',
    'Подписки не забыл оплатить?',
    'Когда на смену в озон?',
    'На завод пойдешь?',
  ],
  upgrades: [
    'Всё прокачал?',
    'Подписки не забыл оплатить?',
    'Когда на смену в озон?',
    'На завод пойдешь?',
  ],
  meta: [
    'Проверял достижения?',
    'Ну, как там перерождения?',
    'Сколько осколков ожидается?',
    'Перерождение не ждёт',
  ],
  settings: [
    'Всё настроил?',
    'Звук зачем выключил?',
    'Музыка не нужна.',
    'И что ты там накрутил?',
  ],
}

export function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pruneTapTimestampsInPlace(buffer, now) {
  let writeIndex = 0
  for (let index = 0; index < buffer.length; index += 1) {
    if (now - buffer[index] <= TAP_SPEED_WINDOW) {
      buffer[writeIndex] = buffer[index]
      writeIndex += 1
    }
  }
  buffer.length = writeIndex
}

export function getTierForTps(tps) {
  for (let index = TAP_SPEED_TIERS.length - 1; index >= 0; index -= 1) {
    if (tps >= TAP_SPEED_TIERS[index].minTps) {
      return TAP_SPEED_TIERS[index]
    }
  }

  return TAP_SPEED_TIERS[0]
}
