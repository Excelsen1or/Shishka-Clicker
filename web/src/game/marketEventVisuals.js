import {
  CoinSpin,
  Crown,
  FloatingGem,
  Lightning,
  Search,
  SocialStar,
  WavingFlag,
} from '../lib/pxlkit'

const EVENT_KIND_VISUALS = {
  positive: {
    accentRgb: '96 214 124',
    glowRgb: '96 214 124',
    icon: FloatingGem,
    tone: 'positive',
  },
  negative: {
    accentRgb: '255 109 84',
    glowRgb: '255 132 92',
    icon: Lightning,
    tone: 'negative',
  },
  mixed: {
    accentRgb: '120 203 255',
    glowRgb: '120 203 255',
    icon: Search,
    tone: 'mixed',
  },
  chain: {
    accentRgb: '168 110 255',
    glowRgb: '168 110 255',
    icon: CoinSpin,
    tone: 'chain',
  },
  idle: {
    accentRgb: '102 224 193',
    glowRgb: '102 224 193',
    icon: Crown,
    tone: 'idle',
  },
}

const EVENT_VISUALS = {
  tarStorm: {
    accentRgb: '255 130 72',
    glowRgb: '255 164 94',
    icon: Lightning,
  },
  districtHype: {
    accentRgb: '255 84 191',
    glowRgb: '255 120 208',
    icon: SocialStar,
  },
  fieldAudit: {
    accentRgb: '115 205 255',
    glowRgb: '151 226 255',
    icon: Search,
  },
  routeOverflow: {
    accentRgb: '255 152 96',
    glowRgb: '255 184 118',
    icon: WavingFlag,
  },
  pineBloom: {
    accentRgb: '92 225 126',
    glowRgb: '132 242 156',
    icon: FloatingGem,
  },
  logisticsCongress: {
    accentRgb: '255 207 88',
    glowRgb: '255 229 130',
    icon: Crown,
  },
  cashbackGlitchChain: {
    accentRgb: '168 110 255',
    glowRgb: '205 160 255',
    icon: CoinSpin,
  },
}

export function getEventVisual(activeEvent) {
  if (!activeEvent) {
    return {
      ...EVENT_KIND_VISUALS.idle,
      title: 'Штатный режим',
    }
  }

  const byId = EVENT_VISUALS[activeEvent.id] ?? {}
  const byKind = EVENT_KIND_VISUALS[activeEvent.kind] ?? EVENT_KIND_VISUALS.idle

  return {
    ...byKind,
    ...byId,
    title: activeEvent.title,
    tone: activeEvent.id ?? activeEvent.kind ?? 'idle',
  }
}
