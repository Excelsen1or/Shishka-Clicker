# Shishka Economy Reshape Design

**Date:** 2026-04-18
**Status:** Draft approved in chat, written for review
**Scope:** Full economy reshape for the clicker loop, prestige loop, market loop, content tone, and save format

## Goal

Rebuild the game economy around a Cookie Clicker style progression loop while preserving the existing post-ironic identity of the project.

The new economy must:

- center the run around one primary production currency;
- add a prestige loop with repeatable quotas and manual reset timing;
- add a rare long-tail meta resource similar in role to sugar lumps;
- add a dedicated market and investment layer on top of the core clicker loop;
- replace the current tone with harsher бытовая post-irony about marketplace life, credit traps, AI automation, gray economy, delivery chaos, reselling, info hustle, and warehouse absurdity;
- intentionally break compatibility with old saves.

## Non-Goals

- No migration of old player progress.
- No use of direct real brand names in content text.
- No political satire.
- No attempt to preserve the current `money` and `knowledge` economy as a first-class system.

## Design Direction

The project should follow Cookie Clicker structurally, but not aesthetically or textually.

The target result is not a clone with renamed cookies. It is a Russian post-ironic satire about runaway marketplace capitalism, warehouse hell, shady logistics, AI-generated sludge, and gray-market speculation, with `шишки` as the center of the absurd machine.

## Visual Direction

The economy reshape UI should lean fully into `PIXEL-UI` presentation instead of reading like a conventional productivity app with game labels attached.

Visual rules:

- hard-edged pixel panels, sharp borders, inset frames, and chunky button states;
- compact arcade-style information density instead of roomy SaaS cards;
- the clicker remains the visual center of gravity;
- support panels should read like an in-game control deck or upgrade console;
- tabs and switches should look like pixel control toggles, not browser-style pills;
- all newly combined panels must preserve the existing placeholder sprite language so the whole economy reads as one game surface.

## Content Tone

Tone rules:

- harsh бытовая post-irony;
- absurd capitalism, debt treadmill, fulfillment chaos, reseller folklore;
- references to recognizable Russian realities through parody and transparent archetypes, not direct brands;
- no direct political satire;
- no clean corporate/product tone;
- jokes must feel written from inside the ecosystem, not as detached internet memes.

Examples of allowed thematic areas:

- pickup point hell;
- warehouse sorting and shortages;
- fake discounts and cashback bugs;
- gray imports;
- resellers and scarcity hype;
- info hustle and marketplace gurus;
- AI automation and content farms;
- credit pressure and installment traps;
- courier rush and last-mile chaos.

Examples of naming style:

- `ПВЗ на окраине`
- `Фиолетовый гигант`
- `Жёлтый маркет`
- `Серый завоз`
- `Инфошум`
- `Кредитный конвейер`

## Core Economy

### Run Currency

`Shishki` become the only primary run currency.

They are used for:

- manual clicking income;
- passive production income;
- buying buildings;
- buying run upgrades;
- buying market goods;
- interacting with market commissions and brokers.

The game should no longer rely on `money` and `knowledge` as parallel run balances.

### Prestige Currency

`Heavenly Shishki` replace the current prestige shard role.

They are earned only by closing run quotas and are spent only in the meta layer around rebirth.

### Rare Meta Resource

`Tar Lumps` act as the long-tail rare resource in the role of sugar lumps.

They are not meant to be farmed as a normal run balance. They accumulate over time and are used for building leveling and late optimization.

### Market Layer

The market is not a separate wallet. It is a trading layer that operates using `shishki`.

The player buys and sells absurd investment goods whose prices fluctuate by archetype.

## Run Loop

The new run loop:

1. Click for `shishki`.
2. Buy buildings for `shishki/sec`.
3. Buy upgrades that amplify clicking, buildings, events, and market behavior.
4. Unlock and use the market for spikes, speculation, and timing plays.
5. Trigger and exploit random event windows.
6. Close quota milestones for `heavenly shishki`.
7. Choose when to rebirth.
8. Spend `heavenly shishki`, repeat at larger scale.

## Building System

Buildings become the main production backbone, replacing the current central role of `subscriptions`.

Each building:

- costs `15%` more than the previous purchase of the same building, matching Cookie Clicker style scaling;
- adds base `shishki/sec`;
- can be affected by upgrades;
- can be leveled with `tar lumps` up to level `10`;
- grants milestone perks at building level `1`, `5`, and `10`.

Proposed building ladder:

1. `Сборщик шишек у гаражей`
2. `ПВЗ на окраине`
3. `Серая сортировка`
4. `Бригада самозанятых`
5. `Ларёк перепродажи`
6. `Смоляной цех`
7. `Подпольный фулфилмент`
8. `Фабрика карточек товара`
9. `Агентство инфошума`
10. `Кредитный конвейер`
11. `Автопарк последней мили`
12. `Храм оптимизации`
13. `Нейро-ферма контента`
14. `Биржа серого импорта`
15. `Министерство шишечной логистики`

## Upgrade System

Run upgrades remain as a separate layer, but are rewritten around the new economy.

Upgrade categories:

- click power upgrades;
- building-specific multipliers;
- cross-building synergy upgrades;
- event-strength upgrades;
- media campaign and hype upgrades;
- market and commission upgrades;
- late-run accelerators.

Upgrade names and descriptions must follow the approved tone, using marketplace and gray-economy satire instead of the current student-and-AI framing.

## Media Hype Layer

The game should include a mid-to-late run system of paid hype campaigns built around parody rap-ambassador archetypes.

This system must not use direct real artist names. It should use transparent cultural archetypes and industry parody.

The media hype layer is not a separate currency. It is a strategic `shishki` sink that creates temporary power windows across the main economy.

The system unlocks through `Агентство инфошума` and is amplified by later media-related upgrades.

### Media Campaign Rules

- the player spends `shishki` to launch a campaign;
- each campaign runs for a short timed window, for example `60-180 seconds`;
- each campaign boosts one or more systems;
- stronger campaigns unlock deeper in progression;
- some campaigns distort market prices and event rates instead of giving raw production only.

### Campaign Effect Types

- temporary click multiplier;
- temporary `shishki/sec` multiplier;
- increased event spawn chance;
- stronger chain-event rewards;
- temporary hype spike for selected market goods;
- temporary discount for a subset of buildings or upgrades.

### Rap-Ambassador Archetypes

- `Ледяной флексер` for short aggressive click bursts and fast hype.
- `Воскресный пророк` for longer production boosts and chain-event support.
- `Плохой парень с промо` for market manipulation and speculative spikes.
- `Мрачный романтик района` for slow but efficient income scaling.
- `Шумный фитмейкер` for event chaos, cheaper mid-tier ramps, and burst windows.

### Market Integration

Media campaigns can temporarily inflate or destabilize specific goods, such as:

- `Инфокурс по маркетплейсам`
- `Нейро-обложки`
- `Дефицитные коробки`
- `Параллельный завоз`

This makes the system an intentional bridge between:

- production;
- event timing;
- market speculation;
- satirical worldbuilding.

The result should feel like paid viral noise, fake momentum, suspicious promo circuits, and recommendation-feed absurdity rather than celebrity fandom.

## Market and Investments

The market opens after the player buys the first `Ларёк перепродажи`.

The player trades goods using `shishki`. Market play should be optional but strong enough to reward skill and timing.

Goods should have recognizable archetypes:

- stable;
- volatile;
- hype-driven;
- trash-tier;
- manipulated;
- rare scarcity goods.

Proposed goods set:

- `Остатки с ПВЗ`
- `Паль`
- `Параллельный завоз`
- `Кэшбэк-купоны`
- `Возвратный товар`
- `Курьерские слоты`
- `Дефицитные коробки`
- `Инфокурс по маркетплейсам`
- `Нейро-обложки`
- `Серые расходники`

Supporting systems:

- broker count or broker tier to reduce fees;
- per-good behavior profile;
- commission on trade;
- unlock pacing by run progression;
- event hooks that temporarily distort one market segment.

The market should feel like a satire of speculative marketplace folklore, not a realistic finance sim.

## Random Event Layer

The event layer replaces the role of golden cookies.

Events appear as short windows that reward clicking, timing, or opportunistic switching.

Proposed event themes:

- `Ошибочный кэшбэк`
- `Серый завоз`
- `Распродажа с багом`
- `Склад прорвало товаром`
- `Инфоцыганский прогрев`
- `Нейросеть выдала конверсию`
- `Возврат без возврата`
- `Курьер успел`
- `Карточку не забанили`

Effect categories:

- instant `shishki` burst;
- temporary production multiplier;
- temporary click multiplier;
- temporary purchase discount;
- temporary market spike;
- chained timing event with escalating rewards.

## Prestige and Rebirth

### Quota Rule

Each run has a quota: accumulate `X shishki during the current life`.

Closing a quota immediately grants `+1 heavenly shishka`.

After a quota is closed, the next quota target rises immediately inside the same life. This means the player can close multiple quotas before rebirthing.

### Rebirth Timing

Rebirth is manual.

The player decides when to reset. They may rebirth after closing one quota or continue pushing for additional quota closures before resetting.

### Rebirth Reset

Rebirth resets:

- current `shishki`;
- owned buildings;
- run upgrades;
- market portfolio and temporary market state;
- short-term event state.

Rebirth keeps:

- `heavenly shishki`;
- `tar lumps`;
- prestige upgrades purchased with `heavenly shishki`;
- achievements and lifetime statistics.

### Prestige Spending

`Heavenly shishki` can only be spent in the meta layer after rebirth.

Example prestige upgrades:

- `Небесная смола` for global production multiplier;
- `Культ складского чуда` for a stronger early ramp;
- `Серая аккредитация` for earlier market access;
- `Гиперлогистика` for stronger random events;
- `Налоговая слепота` for lower market fees;
- `Конвейер абсурда` for late building scaling;
- `Пыль архивов` for faster tar lump progression.

## Tar Lumps

`Tar lumps` are the long-tail optimization resource.

Rules:

- grow on a real-time cadence, not as normal run income;
- spent to level buildings from `0` to `10`;
- building levels persist through rebirths and grant permanent structural perks to the associated building line;
- key breakpoints are at `1`, `5`, and `10`.

Examples of building specialization unlocks:

- pickup point building gains a chance for `lost package` style bonus events;
- fulfillment building reduces market friction for a subset of goods;
- AI content farm amplifies hype-based event effects.

## Save and Versioning

Old saves will not be migrated.

Required changes:

- new local save key;
- new save export version;
- updated import validation that rejects legacy economy payloads as incompatible;
- cloud save payload continues to use JSON, but the client-side schema changes completely.

This is an intentional hard break in progression continuity.

## State Model Changes

### Remove From Primary Run State

- `money`
- `knowledge`
- `moneyPerSecond`
- `knowledgePerSecond`
- any economy logic centered on these balances

### Keep and Rename

- `shishki`
- `manualClicks`
- lifetime and total `shishki` metrics
- `prestigeShards` -> `heavenlyShishki`

### Add

- `tarLumps`
- `buildings`
- `market`
- `eventState`
- quota progression fields for current life
- new prestige upgrade tree aligned to `heavenlyShishki`

## UI Mapping

### Clicker Screen

Show:

- current `shishki`;
- `shishki/sec`;
- current quota progress;
- `heavenly shishki`;
- `tar lumps`;
- active event state.

The clicker hero should be visually rebuilt around a central button and one wide switchable control deck placed directly below the button.

Layout rules:

- keep the clicker button as the center of the screen;
- keep the top area focused on the clicker button and short run metrics;
- place a single wide `pixel control deck` immediately below the clicker button;
- remove the split left/right/bottom panel composition in favor of one combined switchable panel;
- remove non-essential text blocks and decorative hero clutter around the clicker;
- keep the hero focused on clicking plus visualized progression.

### Clicker Control Deck

The unified control deck under the clicker must expose four pixel-tab views:

- `Здания`
- `Рынок и хайп`
- `Усиления`
- `Мета`

Rules:

- only one deck view is visible at a time;
- switching views should feel like changing pages on a game terminal, not routing between full app screens;
- each view reuses the existing economy snapshot data instead of inventing a separate state model;
- the deck must stay visually dense and game-like on desktop and mobile;
- on mobile, deck tabs may wrap into two rows or scroll horizontally, but the deck remains below the clicker button.

### Clicker Progress Field

The main screen should gain a visual progress field built from fixed-size `32x32` entity images.

Important distinction:

- `32x32` refers to the size of each image/sprite;
- the field containers themselves remain adaptive and respond to screen size.

The field is not a freeform decorative scene. It is a readable progression layer that reflects what the player has actually built or unlocked.

Zone semantics:

- left zone visualizes owned buildings and building growth;
- right zone visualizes market goods, gray-economy signals, and active media hype campaigns;
- bottom zone visualizes upgrades, prestige, rebirth markers, and `tar lumps`.

Rendering rules:

- every displayed entity uses a `32x32` sprite or placeholder tile;
- fields may stack or cap repeated entities instead of rendering exact 1:1 counts at high ownership totals;
- locked entities appear muted;
- active or boosted entities may receive stronger frame treatment, glow, or badge state;
- the center hero area should not contain extra banners or descriptive filler once the field is present.

### Placeholder Sprite System

Until final pixel-art assets are produced, the UI should use a unified placeholder sprite system for both field entities and economy cards.

The placeholder system must:

- provide a consistent `32x32` slot for every building, market good, campaign, upgrade, and meta item;
- use type-specific framing, color, and shorthand codes so different systems remain readable;
- support states such as `locked`, `owned`, `active`, `stacked`, and `upgraded`;
- be easy to replace later with real sprites without changing component structure.

Suggested placeholder approach:

- buildings use industrial and logistics framing;
- market goods use speculative or commodity framing;
- campaigns use promo/media framing;
- upgrades and meta items use coupon, token, seal, shard, or lump framing.

The same visual identity should appear both in the clicker field and inside cards across shop and market screens.

### Purchases Screen

The bottom navigation should no longer expose separate `Здания` and `Улучшения` tabs.

Replace them with one tab named `Покупки`.

The `Покупки` screen must contain a top-level pixel switcher with exactly two views:

- `Здания`
- `Улучшения`

Rules:

- both views live inside one screen component;
- the switcher is rendered near the top of the screen under the header;
- switching does not change route identity or bottom-nav state;
- both modes keep the shared card language, sprite slots, and pixel control styling;
- the screen should read like one in-game shop terminal with two inventory pages, not two separate pages bolted together.

### Shop Screen Cards

The purchases UI must preserve the existing shared card system while pushing it further toward a pixel-shop feel.

Economy cards should reserve a left-aligned `32x32` sprite slot immediately in the card layout, even before final assets exist.

If a final asset is unavailable, the card should render the shared placeholder tile for that entity instead of leaving the slot empty.

### Meta Screen

Rewrite around:

- quota chain;
- rebirth action;
- `heavenly shishki`;
- prestige upgrade tree;
- `tar lumps` and building levels.

### Market Screen

Add a dedicated screen for:

- price board;
- owned positions;
- fees and broker effects;
- market event modifiers.

### Dev Console

Rewrite resource commands to support only the new economy model.

## Code Mapping

### `web/src/game/config.js`

Becomes the main definition source for:

- new starting state;
- building definitions;
- run upgrade definitions;
- market goods;
- event definitions;
- tar lump rules.

### `web/src/game/metaConfig.js`

Rewritten to define:

- quota growth per life;
- quota closure reward logic;
- rebirth preview;
- prestige upgrade costs and effects;
- `heavenly shishki` progression.

### `web/src/stores/GameStore.js`

This file becomes the main implementation site for:

- production from buildings;
- click logic under the new economy;
- quota chain updates;
- rebirth reset rules;
- market transactions;
- event spawning and resolution;
- tar lump progression;
- new save shape handling.

### UI Components

Primary rewrites expected in:

- `web/src/components/shop/ShopScreen.jsx`
- `web/src/components/meta/MetaScreen.jsx`
- `web/src/components/clicker/ProgressOverview.jsx`
- `web/src/components/ui/DevConsole.jsx`

New market-specific components are expected:

- `MarketScreen`
- `MarketTicker`
- `MarketPortfolio`
- `MarketTradePanel`

Additional clicker-field components are expected:

- `ProgressFieldPanel`
- `ProgressSprite`
- a shared placeholder/icon component for economy entities

The clicker screen rewrite should remove the current text banner under the clicker and replace it with the new field-based visualization model.

## Testing Requirements

The implementation plan must cover tests or verification for:

- building price scaling;
- passive income calculation;
- quota closure and repeated quota chaining in one life;
- rebirth reset behavior;
- `heavenly shishki` retention and spending;
- tar lump accumulation and building leveling;
- market buy/sell pricing and fee rules;
- event spawning and event reward application;
- legacy save rejection;
- new save export/import round-trip.

## Open Decisions Already Resolved

- Use parody and transparent archetypes instead of direct real brand names.
- Tone is harsher post-irony focused on household economic absurdity.
- No direct political satire.
- Cookie Clicker structure is the base, but the identity remains unique to this project.
- Old saves are intentionally invalidated.
- The new economy is centered on one run currency plus prestige, rare meta resource, and market layer.
- The clicker screen uses one unified control deck below the main button instead of split side panels.
- The bottom navigation merges buildings and upgrades into one `Покупки` tab.
- The UI direction for these screens is explicitly `PIXEL-UI`, not generic app UI.

## Implementation Readiness

This spec is focused enough for a single implementation plan.

The recommended execution order is:

1. Rewrite data model and config.
2. Rewrite `GameStore` economy core.
3. Rewrite run/meta UI around the new model.
4. Add market screen and systems.
5. Rewrite content text and flavor.
6. Break old save compatibility and verify new save shape.
