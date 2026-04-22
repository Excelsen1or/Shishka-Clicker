import { EVENT_DEFINITIONS, RAP_CAMPAIGNS } from '../../game/economyConfig.js'

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

export const USER_CONSOLE_COMMANDS_DESC = {
  date: 'показывает текущую дату',
  clear: 'очищает консоль',
  help: 'выводит список команд',
}

export const DEV_CONSOLE_COMMANDS_DESC = {
  ...USER_CONSOLE_COMMANDS_DESC,
  'sv.www <true|false|1|0>': 'включает или выключает режим разработчика',
  'tick <сек>': 'проматывает экономику на указанное число секунд',
  'event <id|clear>': 'вручную ставит или очищает рыночный ивент',
  'campaign <id|clear>': 'вручную ставит или очищает прогрев',
  'market <unlock|lock>': 'открывает или закрывает рынок',
  'quota ready': 'доводит текущий ран до квоты',
  rebirth: 'делает перерождение, если квота уже готова',
}

export const DEV_CONSOLE_EMPTY_LOG_HINT = {
  disabled: [
    'Короче, читы - бан, кемперство - бан, оскорбление - бан, оскорбление администрации - расстрел потом бан. Всем удачи.',
    'Введите help для помощи.',
  ],
  enabled: [
    'Введите help для списка команд.',
    'Доступны give, set, status и sv.www false.',
  ],
}

const RESOURCE_BY_ID = Object.fromEntries(
  DEV_CONSOLE_RESOURCES.map((resource) => [resource.id, resource]),
)

const RESOURCE_COMMAND_PATTERN =
  /^(give|set)\s+(shishki|heavenly|lumps)\s+([0-9eE+.]+)$/i
const DEV_TOGGLE_PATTERN = /^sv\.www\s+(true|false|1|0)$/i
const DEV_TROLL_PATTERN = /^sv[._]cheats\s+(true|1)$/i
const TICK_PATTERN = /^tick\s+([0-9eE+.]+)$/i
const EVENT_PATTERN = /^event\s+([a-z][a-z0-9]*)$/i
const EVENT_CLEAR_PATTERN = /^event\s+clear$/i
const CAMPAIGN_PATTERN = /^campaign\s+([a-z][a-z0-9]*)$/i
const CAMPAIGN_CLEAR_PATTERN = /^campaign\s+clear$/i
const MARKET_TOGGLE_PATTERN = /^market\s+(unlock|lock)$/i
const QUOTA_READY_PATTERN = /^quota\s+ready$/i
const REBIRTH_PATTERN = /^rebirth$/i
const EVENT_ID_MAP = Object.fromEntries(
  EVENT_DEFINITIONS.map((item) => [item.id.toLowerCase(), item.id]),
)
const CAMPAIGN_ID_MAP = Object.fromEntries(
  RAP_CAMPAIGNS.map((item) => [item.id.toLowerCase(), item.id]),
)

export function buildDevConsoleStatusLine(resources) {
  return DEV_CONSOLE_RESOURCES.map((resource) => {
    const value = resources?.[resource.textKey] ?? '0'
    return `${resource.label}: ${value}`
  }).join(' | ')
}

export function getDevConsoleCheatsHelpLines() {
  return [
    'give <ресурс> <число> | set <ресурс> <число> | status | sv.www false',
    'tick <сек> | event <id|clear> | campaign <id|clear>',
    'market <unlock|lock> | quota ready | rebirth',
    'Ресурсы: shishki, heavenly, lumps',
    `Ивенты: ${Object.values(EVENT_ID_MAP).join(', ')}`,
    `Прогревы: ${Object.values(CAMPAIGN_ID_MAP).join(', ')}`,
  ]
}

export function parseDevConsoleControlCommand(input) {
  const command = input.trim()
  const toggleMatch = command.match(DEV_TOGGLE_PATTERN)

  if (toggleMatch) {
    const rawValue = toggleMatch[1].toLowerCase()

    return {
      type: 'toggleCheats',
      enabled: rawValue === 'true' || rawValue === '1',
    }
  }

  if (DEV_TROLL_PATTERN.test(command)) {
    return { type: 'troll' }
  }

  return null
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

  const controlCommand = parseDevConsoleControlCommand(cmd)
  if (controlCommand) {
    return controlCommand
  }

  if (cmd === 'status') {
    return { type: 'status' }
  }

  if (QUOTA_READY_PATTERN.test(cmd)) {
    return { type: 'quotaReady' }
  }

  if (REBIRTH_PATTERN.test(cmd)) {
    return { type: 'rebirth' }
  }

  const tickMatch = cmd.match(TICK_PATTERN)
  if (tickMatch) {
    const seconds = Number(tickMatch[1])

    return Number.isFinite(seconds) && seconds > 0
      ? { type: 'tick', seconds }
      : { type: 'invalid' }
  }

  if (EVENT_CLEAR_PATTERN.test(cmd)) {
    return { type: 'event', eventId: null }
  }

  const eventMatch = cmd.match(EVENT_PATTERN)
  if (eventMatch) {
    const eventId = EVENT_ID_MAP[eventMatch[1]]
    return eventId ? { type: 'event', eventId } : { type: 'invalid' }
  }

  if (CAMPAIGN_CLEAR_PATTERN.test(cmd)) {
    return { type: 'campaign', campaignId: null }
  }

  const campaignMatch = cmd.match(CAMPAIGN_PATTERN)
  if (campaignMatch) {
    const campaignId = CAMPAIGN_ID_MAP[campaignMatch[1]]
    return campaignId
      ? { type: 'campaign', campaignId }
      : { type: 'invalid' }
  }

  const marketToggleMatch = cmd.match(MARKET_TOGGLE_PATTERN)
  if (marketToggleMatch) {
    return {
      type: 'marketToggle',
      enabled: marketToggleMatch[1] === 'unlock',
    }
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
