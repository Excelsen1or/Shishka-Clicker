export {
  BUILDINGS,
  MARKET_GOODS,
  PRESTIGE_UPGRADES,
  QUOTA_RULES,
  RAP_CAMPAIGNS,
  RUN_UPGRADES as UPGRADES,
  STARTING_STATE,
  TAR_LUMP_RULES,
} from './economyConfig.js'

export {
  accrueTarLumps,
  applyMarketTrade,
  deriveProduction,
  deriveProduction as deriveEconomy,
  getBuildingCost,
  getCampaignById,
  getQuotaTarget,
  resolveQuotaClosures,
} from './economyMath.js'
