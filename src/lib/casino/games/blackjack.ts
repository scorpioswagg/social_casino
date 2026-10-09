import { secureInt } from "./rng";

export type Suit = "S" | "H" | "D" | "C";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export type Card = { rank: Rank; suit: Suit };

export type BjPhase =
  | "betting"
  | "player"
  | "dealer"
  | "resolved";

export type BjHand = {
  cards: Card[];
  stand: boolean;
  doubled: boolean;
};

export type BjState = {
  sessionId: string;
  phase: BjPhase;
  shoe: Card[];
  player: BjHand;
  dealer: BjHand;
  bet: number;
  /** Additional amount for double */
  doubleBet: number;
  result?: "player_bj" | "dealer_bj" | "player_win" | "dealer_win" | "push";
  payout: number;
};

const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS: Suit[] = ["S", "H", "D", "C"];

function freshShoe(decks = 4): Card[] {
  const cards: Card[] = [];
  for (let d = 0; d < decks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({ rank, suit });
      }
    }
  }
  // Fisher-Yates with secure RNG
  for (let i = cards.length - 1; i > 0; i--) {
    const j = secureInt(i + 1);
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function draw(shoe: Card[]): Card {
  const c = shoe.pop();
  if (!c) throw new Error("Shoe empty");
  return c;
}

export function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === "A") {
      aces++;
      total += 11;
    } else if (c.rank === "J" || c.rank === "Q" || c.rank === "K") {
      total += 10;
    } else {
      total += Number(c.rank);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 && total <= 21 };
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards).total === 21;
}

export function startRound(sessionId: string, bet: number): BjState {
  if (bet < 10 || bet > 10000) throw new Error("Bet out of range");
  const shoe = freshShoe(4);
  const player: BjHand = { cards: [draw(shoe), draw(shoe)], stand: false, doubled: false };
  const dealer: BjHand = { cards: [draw(shoe), draw(shoe)], stand: false, doubled: false };

  let phase: BjPhase = "player";
  let result: BjState["result"];
  let payout = 0;

  const pBj = isBlackjack(player.cards);
  const dBj = isBlackjack(dealer.cards);

  if (pBj || dBj) {
    phase = "resolved";
    if (pBj && dBj) {
      result = "push";
      payout = bet; // return stake
    } else if (pBj) {
      result = "player_bj";
      payout = bet + Math.floor(bet * 1.5); // 3:2
    } else {
      result = "dealer_bj";
      payout = 0;
    }
  }

  return {
    sessionId,
    phase,
    shoe,
    player,
    dealer,
    bet,
    doubleBet: 0,
    result,
    payout,
  };
}

export function playerHit(state: BjState): BjState {
  if (state.phase !== "player") throw new Error("Not player turn");
  const next = structuredClone(state) as BjState;
  next.player.cards.push(draw(next.shoe));
  const { total } = handValue(next.player.cards);
  if (total > 21) {
    next.phase = "resolved";
    next.result = "dealer_win";
    next.payout = 0;
  } else if (total === 21) {
    next.player.stand = true;
    return finishDealer(next);
  }
  return next;
}

export function playerStand(state: BjState): BjState {
  if (state.phase !== "player") throw new Error("Not player turn");
  const next = structuredClone(state) as BjState;
  next.player.stand = true;
  return finishDealer(next);
}

export function playerDouble(state: BjState): BjState {
  if (state.phase !== "player") throw new Error("Not player turn");
  if (state.player.cards.length !== 2 || state.player.doubled) {
    throw new Error("Double only on first two cards");
  }
  const next = structuredClone(state) as BjState;
  next.doubleBet = next.bet;
  next.player.doubled = true;
  next.player.cards.push(draw(next.shoe));
  next.player.stand = true;
  const { total } = handValue(next.player.cards);
  if (total > 21) {
    next.phase = "resolved";
    next.result = "dealer_win";
    next.payout = 0;
    return next;
  }
  return finishDealer(next);
}

function finishDealer(state: BjState): BjState {
  const next = structuredClone(state) as BjState;
  next.phase = "dealer";
  // Dealer hits soft 17
  while (true) {
    const { total, soft } = handValue(next.dealer.cards);
    if (total < 17 || (total === 17 && soft)) {
      next.dealer.cards.push(draw(next.shoe));
    } else break;
  }
  next.phase = "resolved";
  const p = handValue(next.player.cards).total;
  const d = handValue(next.dealer.cards).total;
  const stake = next.bet + next.doubleBet;

  if (p > 21) {
    next.result = "dealer_win";
    next.payout = 0;
  } else if (d > 21) {
    next.result = "player_win";
    next.payout = stake * 2;
  } else if (p > d) {
    next.result = "player_win";
    next.payout = stake * 2;
  } else if (p < d) {
    next.result = "dealer_win";
    next.payout = 0;
  } else {
    next.result = "push";
    next.payout = stake;
  }
  return next;
}

/** Safe client-facing snapshot (hides remaining shoe & hole card until resolved). */
export function publicBjView(state: BjState) {
  const hideHole = state.phase !== "resolved" && state.phase !== "dealer";
  return {
    sessionId: state.sessionId,
    phase: state.phase,
    bet: state.bet,
    doubleBet: state.doubleBet,
    player: state.player,
    dealer: {
      cards: hideHole ? [state.dealer.cards[0], { rank: "?" as Rank, suit: "S" as Suit }] : state.dealer.cards,
      stand: state.dealer.stand,
      doubled: false,
    },
    playerTotal: handValue(state.player.cards).total,
    dealerTotal: state.phase === "resolved" || state.phase === "dealer"
      ? handValue(state.dealer.cards).total
      : handValue([state.dealer.cards[0]]).total,
    result: state.result,
    payout: state.payout,
  };
}
