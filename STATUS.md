# Nocturne — Build Status

**Last updated:** 2026-10-08  
**Repo:** https://github.com/scorpioswagg/social_casino  
**Product posture:** Free-to-play social casino. Casino Coins have **no cash value** and cannot be withdrawn, sold, or converted to money.

---

## What is live today

### Foundation
- [x] Auth (Better Auth — login / register / session)
- [x] PostgreSQL schema (profiles, balances, immutable currency ledger, games, sessions, rewards, missions, achievements, VIP, leaderboards, friends, messages, notifications, support tickets, roles/RBAC, audit logs)
- [x] Player provisioning + signup bonus + daily envelope
- [x] Premium Nocturne design system (midnight / gold / sapphire)
- [x] Home lobby (featured, hot, new, popular, daily, missions, VIP, leaderboard, seasonal teaser)
- [x] Game catalog + favorites + recent
- [x] Player profile, rewards, VIP, friends, leaderboards, support, settings routes
- [x] Admin shell + overview, players, economy, audit, support lists

### Games (server-authoritative)
- [x] **Configurable slot engine** (weighted strips, paylines, wilds, scatters, free-spin awards)
- [x] **5 slot themes:** Midnight Reels, Crown Jacks, Ember Slots, Cosmic Fortune, Pharaoh's Gold
- [x] **European Roulette** (Velvet Wheel) — outside + straight bets, server RNG
- [x] **Blackjack** (House 21) — hit / stand / double, dealer soft-17, 3:2 BJ, hole-card hide
- [x] Transactional coin debit/credit on every wager & payout
- [x] Game session + player_stats + XP updates
- [x] Rate limits on play endpoints

### Explicitly **not** implemented (and correctly so)
- Real-money deposits, withdrawals, cash prizes, or cash-out
- Payment → wager → payout loops
- Client-side outcome generation

---

## Prioritized backlog

### P0 — Next playable polish
1. Split / insurance for Blackjack
2. Free-spin auto-play loop for slots when scatter awards spins
3. Persist BJ session state in Redis (or DB) instead of process memory
4. Richer win animations / confetti / reduced-motion respect on big wins
5. Sound identity pass (spin, card deal, wheel, win tiers)

### P1 — Progression & retention
1. Full 30-day daily reward calendar + streak protection
2. Expand achievements to ~100 definitions + unlock hooks from play
3. Daily / weekly / seasonal missions with real progress tracking
4. Reusable events engine (start/end, event currency, leaderboard, shop)
5. Leaderboard scoring from actual play metrics (not just XP)

### P1 — Admin depth
1. Real DAU / WAU / MAU + retention widgets
2. Player detail: suspend, grant promo coins (audited), view sessions
3. Economy tools: currency sinks/sources reports
4. Content manager: toggle game live/coming_soon, edit copy

### P2 — Social & multiplayer
1. Friend requests accept/decline + online status
2. Private messaging + table chat
3. Texas Hold'em (start with single-table play-money, then private/public)
4. Spectator mode + emotes
5. Reporting / muting / moderation queue

### P2 — Platform
1. Notification center (in-app) + preference controls
2. Responsible-play: session timer, break reminders, self-exclusion
3. Age-gate + ToS / Privacy / Responsible-play policy pages
4. Comprehensive automated tests (game math, ledger, authz, rate limits)
5. Performance: code-split game bundles, image/CDN pass

### P3 — Optional later
1. Entertainment-only monetization abstraction (never tied to wagering)
2. Stack migration notes if Next.js + Prisma is ever required (currently TanStack Start + Kysely)

---

## Architecture notes

| Layer | Choice |
|-------|--------|
| Framework | TanStack Start (Vite + React 19) |
| Auth | Better Auth |
| DB | PostgreSQL via Kysely / tagged SQL (`getSql`) — Neon or PGLite fallback |
| RNG | `node:crypto` rejection sampling (`src/lib/casino/games/rng.ts`) |
| Economy | `applyLedger` — single write path for balances + immutable transactions |
| Games | `src/lib/casino/games/*` — pure logic; `play.ts` orchestrates ledger + sessions |

**Rule:** Authoritative outcomes are never computed in the browser.

---

## How to verify playable games

1. Sign in (or use preview auth).
2. Open **Games** → any live slot (Midnight Reels, Crown Jacks, Ember Slots, Cosmic Fortune, Pharaoh's Gold).
3. Place a bet and spin — balance updates; wins credit via ledger.
4. Open **Velvet Wheel** — place outside/straight bets and spin.
5. Open **House 21** — deal, hit/stand/double; resolve pays 3:2 on BJ.

All amounts are **Casino Coins (virtual only)**.

---

## Definition of done (from product vision) — remaining

- [ ] Poker multiplayer
- [ ] Full events / 30-day calendar / 100 achievements
- [ ] Complete admin analytics + player management actions
- [ ] Social graph + chat moderation
- [ ] E2E + game-math test suite
- [ ] Accessibility audit sign-off
- [ ] Production env docs + deployment runbook

Build quality over feature count. Security and trust over speed.
