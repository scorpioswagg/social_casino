import { classicPaylines5x3, type SlotTheme } from "./slot-engine";

const commonPays = {
  low: [2, 8, 25] as [number, number, number],
  mid: [5, 20, 80] as [number, number, number],
  high: [15, 60, 250] as [number, number, number],
  wild: [20, 100, 500] as [number, number, number],
};

/** Midnight Reels — deep sapphire + gold */
export const midnightReels: SlotTheme = {
  id: "g_midnight_reels",
  slug: "midnight-reels",
  name: "Midnight Reels",
  reels: 5,
  rows: 3,
  paylines: classicPaylines5x3(),
  minBet: 10,
  maxBet: 5000,
  scatterFreeSpins: { threshold: 3, spins: 8 },
  symbols: [
    { id: "cherry", label: "Cherry", weight: 28, pays: commonPays.low },
    { id: "lemon", label: "Lemon", weight: 26, pays: commonPays.low },
    { id: "bell", label: "Bell", weight: 18, pays: commonPays.mid },
    { id: "bar", label: "Bar", weight: 14, pays: commonPays.mid },
    { id: "seven", label: "Seven", weight: 8, pays: commonPays.high },
    { id: "crown", label: "Crown", weight: 5, pays: commonPays.high },
    { id: "wild", label: "Wild", weight: 4, pays: commonPays.wild, isWild: true },
    { id: "scatter", label: "Moon", weight: 3, pays: [0, 0, 0], isScatter: true },
  ],
};

/** Crown Jacks — royal high volatility */
export const crownJacks: SlotTheme = {
  id: "g_crown_jacks",
  slug: "crown-jacks",
  name: "Crown Jacks",
  reels: 5,
  rows: 3,
  paylines: classicPaylines5x3(),
  minBet: 20,
  maxBet: 10000,
  scatterFreeSpins: { threshold: 3, spins: 10 },
  symbols: [
    { id: "ace", label: "Ace", weight: 22, pays: commonPays.low },
    { id: "king", label: "King", weight: 20, pays: commonPays.low },
    { id: "queen", label: "Queen", weight: 16, pays: commonPays.mid },
    { id: "jack", label: "Jack", weight: 14, pays: commonPays.mid },
    { id: "diamond", label: "Diamond", weight: 8, pays: commonPays.high },
    { id: "royal", label: "Royal", weight: 5, pays: commonPays.high },
    { id: "wild", label: "Joker", weight: 4, pays: commonPays.wild, isWild: true },
    { id: "scatter", label: "Crest", weight: 3, pays: [0, 0, 0], isScatter: true },
  ],
};

/** Ember Slots — warm jewel tones */
export const emberSlots: SlotTheme = {
  id: "g_ember_slots",
  slug: "ember-slots",
  name: "Ember Slots",
  reels: 5,
  rows: 3,
  paylines: classicPaylines5x3(),
  minBet: 10,
  maxBet: 5000,
  scatterFreeSpins: { threshold: 3, spins: 7 },
  symbols: [
    { id: "coal", label: "Coal", weight: 30, pays: commonPays.low },
    { id: "spark", label: "Spark", weight: 24, pays: commonPays.low },
    { id: "flame", label: "Flame", weight: 16, pays: commonPays.mid },
    { id: "ruby", label: "Ruby", weight: 12, pays: commonPays.mid },
    { id: "phoenix", label: "Phoenix", weight: 7, pays: commonPays.high },
    { id: "ember", label: "Ember", weight: 5, pays: commonPays.high },
    { id: "wild", label: "Wildfire", weight: 4, pays: commonPays.wild, isWild: true },
    { id: "scatter", label: "Ash", weight: 3, pays: [0, 0, 0], isScatter: true },
  ],
};

/** Cosmic Fortune — space theme (extra demo) */
export const cosmicFortune: SlotTheme = {
  id: "g_cosmic_fortune",
  slug: "cosmic-fortune",
  name: "Cosmic Fortune",
  reels: 5,
  rows: 3,
  paylines: classicPaylines5x3(),
  minBet: 15,
  maxBet: 7500,
  scatterFreeSpins: { threshold: 3, spins: 12 },
  symbols: [
    { id: "meteor", label: "Meteor", weight: 26, pays: commonPays.low },
    { id: "comet", label: "Comet", weight: 22, pays: commonPays.low },
    { id: "planet", label: "Planet", weight: 15, pays: commonPays.mid },
    { id: "nebula", label: "Nebula", weight: 12, pays: commonPays.mid },
    { id: "star", label: "Star", weight: 8, pays: commonPays.high },
    { id: "galaxy", label: "Galaxy", weight: 5, pays: commonPays.high },
    { id: "wild", label: "Void", weight: 4, pays: commonPays.wild, isWild: true },
    { id: "scatter", label: "Orbit", weight: 3, pays: [0, 0, 0], isScatter: true },
  ],
};

/** Pharaoh's Gold */
export const pharaohsGold: SlotTheme = {
  id: "g_pharaohs_gold",
  slug: "pharaohs-gold",
  name: "Pharaoh's Gold",
  reels: 5,
  rows: 3,
  paylines: classicPaylines5x3(),
  minBet: 10,
  maxBet: 5000,
  scatterFreeSpins: { threshold: 3, spins: 9 },
  symbols: [
    { id: "scarab", label: "Scarab", weight: 28, pays: commonPays.low },
    { id: "ankh", label: "Ankh", weight: 24, pays: commonPays.low },
    { id: "eye", label: "Eye", weight: 16, pays: commonPays.mid },
    { id: "urn", label: "Urn", weight: 12, pays: commonPays.mid },
    { id: "sphinx", label: "Sphinx", weight: 7, pays: commonPays.high },
    { id: "pharaoh", label: "Pharaoh", weight: 5, pays: commonPays.high },
    { id: "wild", label: "Anubis", weight: 4, pays: commonPays.wild, isWild: true },
    { id: "scatter", label: "Pyramid", weight: 3, pays: [0, 0, 0], isScatter: true },
  ],
};

export const SLOT_THEMES: Record<string, SlotTheme> = {
  "midnight-reels": midnightReels,
  "crown-jacks": crownJacks,
  "ember-slots": emberSlots,
  "cosmic-fortune": cosmicFortune,
  "pharaohs-gold": pharaohsGold,
};

export function getSlotTheme(slug: string): SlotTheme | null {
  return SLOT_THEMES[slug] ?? null;
}
