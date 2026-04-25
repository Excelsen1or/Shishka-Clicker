# Upgrade Pool Expansion Design

## Goal

Expand the run-upgrade pool so the shop progression lasts longer across the whole game and the upgrade list stops feeling like a narrow chain of production multipliers.

The expansion should:

- increase the total number of run upgrades from `8` to `20`;
- keep production upgrades present but no longer dominant;
- add more reasons to buy upgrades in early, mid, and late game;
- avoid introducing new resources, screens, or standalone systems;
- reuse the existing economy structure in `web/src/game/economyConfig.js`.

## Target Structure

The final run-upgrade pool should be split into these groups:

- `3` production upgrades;
- `5` click upgrades;
- `4` economy upgrades;
- `4` event upgrades;
- `4` campaign upgrades.

Existing production-heavy upgrades remain in the pool, but most new additions should be non-production upgrades so shop progression becomes broader instead of steeper.

## Upgrade Categories

### Production

Production stays a rare, high-impact branch.

Current production branch after rebalance:

- `Складской ритм`
- `Тихая логистика`
- `Серый тендерный цикл`
- `Волна уличных контрактов`

Implementation note:

- keep only the intended production-heavy subset as the strongest direct income levers;
- do not add more cheap `globalMultiplier` upgrades.

### Click

Click upgrades should fill the early and mid-game gaps between manual play and stable passive growth.

New click upgrades:

- `Двойной замах` — `clickMultiplier` — cost `700` — value `0.75`
- `Сбитый счётчик` — `clickMultiplier` — cost `2_400` — value `1.25`
- `Рука набита` — `clickMultiplier` — cost `8_500` — value `2`

These should stack with the existing click branch:

- `Ошибочный кэшбэк`
- `Уличный промо-рывок`
- `Теневая курьерская линия`

### Economy

Economy upgrades should slow progression less by raising income and more by improving purchase efficiency.

New economy upgrades:

- `Оптовая договорённость` — `buildingDiscount` — cost `1_200` — value `0.03`
- `Складская уступка` — `buildingDiscount` — cost `6_500` — value `0.04`
- `Ночная распродажа мест` — `upgradeDiscount` — cost `14_000` — value `0.05`

Economy upgrades should:

- reduce price pressure on buildings or upgrades;
- avoid turning early growth explosive;
- stay weaker than direct production in short-term output, but stronger in long runs.

### Events

Event upgrades should make the event layer more reliable and less swingy.

New event upgrades:

- `Тёплый фон` — `eventPositiveChance` — cost `5_000` — value `0.08`
- `Тихий обход` — `eventNegativeReduction` — cost `11_000` — value `0.10`
- `Лента на подхвате` — `eventDurationBoost` — cost `22_000` — value `0.15`
- one additional event-tier slot should be reserved if balancing later shows a dead zone between mid and late event progression.

These upgrades should:

- improve the value of positive events;
- reduce the frustration of negative events;
- extend the usefulness of the event system into later runs.

### Campaigns

Campaign upgrades should reinforce the existing media-hype layer and give the player more mid-to-late decisions.

New campaign upgrades:

- `Прогрев района` — `campaignDiscount` — cost `12_000` — value `0.08`
- `Медийный хвост` — `campaignDurationBoost` — cost `26_000` — value `0.20`
- `Рекламный перегиб` — `campaignEffectBoost` — cost `55_000` — value `0.12`
- one additional campaign-tier slot should be reserved if balancing later shows a gap before the late game.

These upgrades should:

- reduce campaign activation friction;
- improve campaign efficiency without replacing production upgrades;
- give late players more reasons to invest outside raw passive gain.

## Tier Distribution

The pool should be distributed across the game like this:

### Early

- `Ошибочный кэшбэк`
- `Складской ритм`
- `Двойной замах`
- `Оптовая договорённость`

### Early Mid

- `Тихая логистика`
- `Сбитый счётчик`
- `Тёплый фон`
- `Прогрев района`

### Mid

- `Серый тендерный цикл`
- `Рука набита`
- `Складская уступка`
- `Тихий обход`

### Mid Late

- `Ночная распродажа мест`
- `Лента на подхвате`
- `Медийный хвост`
- `Уличный промо-рывок`

### Late

- `Волна уличных контрактов`
- `Рекламный перегиб`
- `Слияние тар-кэша`
- `Теневая курьерская линия`

## Data Model

The expansion should continue using `RUN_UPGRADES` in `web/src/game/economyConfig.js`.

Each new entry should follow the existing shape:

- `id`
- `fieldCode`
- `title`
- `kind`
- `cost`
- `value`

No new config collection should be introduced.

## Shop Behavior

The shop should continue rendering all run upgrades through the same upgrade card flow.

The UI should:

- show player-facing labels for the new upgrade kinds;
- display readable descriptions for discount, event, and campaign effects;
- keep the shop list understandable even with the larger pool.

This means `ShopScreen` upgrade-label formatting will need to support the new `kind` values.

## Economy Rules

Balancing rules for the expanded pool:

- direct production upgrades must stay the strongest per-upgrade power spikes;
- click upgrades should dominate only in early or click-focused play;
- economy upgrades should pay back over multiple purchases, not instantly;
- event and campaign upgrades should feel useful only once those systems are already relevant;
- late upgrades should cost enough to avoid trivial full-clear of the shop.

## Testing

Implementation should update or add tests for:

- `RUN_UPGRADES` coverage and field codes;
- shop labels for the new upgrade kinds;
- any pricing logic affected by building or upgrade discounts;
- event and campaign math if the new upgrade kinds are wired into those calculations.

At minimum:

- update config expectations in economy tests;
- update shop rendering tests;
- add targeted tests for new modifier behavior.

## Scope Limits

This change does not include:

- new currencies;
- new UI screens;
- new market goods;
- new campaign entities;
- new event definitions;
- a prestige tree redesign.

The change is limited to expanding and rebalancing the run-upgrade pool.
