export const DEV_CONSOLE_RESOURCES = [
  {
    id: 'shishki',
    label: 'Шишки',
    storeKey: 'shishki',
    textKey: 'shishkiText',
  },
  {
    id: 'heavenly',
    label: 'Небесные шишки',
    storeKey: 'heavenlyShishki',
    textKey: 'heavenlyShishkiText',
  },
  {
    id: 'lumps',
    label: 'Комки смолы',
    storeKey: 'tarLumps',
    textKey: 'tarLumpsText',
  },
]

export const DEV_CONSOLE_COMMANDS_DESC = {
  date: 'показывает текущую дату',
  clear: 'очищает консоль',
  help: 'выводит список команд',
}

export const DEV_CONSOLE_EMPTY_LOG_HINT = {
  disabled: [
    'Короче, читы - бан, кемперство - бан, оскорбление - бан, оскорбление администрации - расстрел потом бан. Всем удачи.',
    'Введите help для помощи.',
  ],
  enabled: [
    'Введите help для списка команд.',
    'Доступны give, set, status и sv.cheats false.',
  ],
}

const RESOURCE_BY_ID = Object.fromEntries(
  DEV_CONSOLE_RESOURCES.map((resource) => [resource.id, resource]),
)

const RESOURCE_COMMAND_PATTERN =
  /^(give|set)\s+(shishki|heavenly|lumps)\s+([0-9eE+.]+)$/i

export function buildDevConsoleStatusLine(resources) {
  return DEV_CONSOLE_RESOURCES.map((resource) => {
    const value = resources?.[resource.textKey] ?? '0'
    return `${resource.label}: ${value}`
  }).join(' | ')
}

export function getDevConsoleCheatsHelpLines() {
  return [
    'give <ресурс> <число> | set <ресурс> <число> | status | sv.cheats false',
    'Ресурсы: shishki, heavenly, lumps',
  ]
}

export function parseDevConsoleResourceCommand(command) {
  const match = command.match(RESOURCE_COMMAND_PATTERN)
  if (!match) {
    return null
  }

  const action = match[1].toLowerCase()
  const resourceId = match[2].toLowerCase()
  const amount = Number(match[3])

  return {
    action,
    resourceId,
    storeKey: RESOURCE_BY_ID[resourceId].storeKey,
    amount,
  }
}

export function parseDevCommand(input) {
  const cmd = input.trim().toLowerCase()

  if (cmd === 'status') {
    return { type: 'status' }
  }

  const parsed = parseDevConsoleResourceCommand(cmd)
  if (!parsed) {
    return { type: 'invalid' }
  }

  const isInvalidAmount =
    !Number.isFinite(parsed.amount) ||
    (parsed.action === 'give' ? parsed.amount <= 0 : parsed.amount < 0)

  if (isInvalidAmount) {
    return { type: 'invalid' }
  }

  return {
    type: parsed.action,
    key: parsed.storeKey,
    value: parsed.amount,
  }
}
