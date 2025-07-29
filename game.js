/*
 * Shithead Card Game Logic
 *
 * This module implements the core mechanics of a variant of the card game
 * sometimes known as "Shithead".  The implementation focuses on the
 * underlying rules and data structures rather than any user interface.  It
 * supports the following features inspired by common house‑rules and the
 * user‑specified variation:
 *
 *  • A standard 52‑card deck is used.  Each player is dealt three face‑down
 *    cards, three face‑up cards and a starting hand of three cards.  At the
 *    beginning of the game players may swap cards between their hand and
 *    their face‑up cards.  Play proceeds clockwise.
 *  • Cards rank from low to high: 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A.
 *    An Ace is high.  Twos are treated as wild cards that can be played on
 *    anything and reset the pile; tens always burn the pile; eights are
 *    transparent; sevens require the next card to be equal to or below a
 *    seven; fives skip the next player; four of a kind burns the pile.
 *  • Players may play any number of cards of the same rank on their turn,
 *    provided the play is legal against the top of the discard pile.  After
 *    playing cards the player's hand is replenished from the deck until it
 *    contains at least three cards (as long as the deck is not empty).  A
 *    player may always choose to pick up the pile instead of playing.
 *  • When a player empties their hand and the stock is empty they move on
 *    to their face‑up cards.  Once the face‑ups are gone they play their
 *    face‑downs blindly.  The first player to shed all of their cards wins;
 *    the last player with cards is the "shithead"【577999048044119†L50-L76】.
 *
 * Note that this code does not attempt to implement a network protocol,
 * graphics or AI decision making.  Those layers can build upon the
 * primitives defined here.  See the README in this repository for a more
 * complete description of the game rules.
 */

class Card {
  /**
   * Construct a card.
   *
   * @param {number} rank Numerical rank of the card. 2 → two, 3 → three,
   *        …, 10 → ten, 11 → jack, 12 → queen, 13 → king, 14 → ace.
   * @param {string} suit One of "hearts", "diamonds", "clubs" or "spades".
   */
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
  }

  /**
   * Human readable representation.
   * @returns {string}
   */
  toString() {
    const names = {
      11: 'J',
      12: 'Q',
      13: 'K',
      14: 'A'
    };
    const rankStr = names[this.rank] || this.rank.toString();
    const suitSymbols = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    };
    return `${rankStr}${suitSymbols[this.suit]}`;
  }
}

class Deck {
  constructor() {
    this.cards = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    // Ranks from 3 to Ace (14) plus 2.  We append 2 at the end because
    // wild cards are treated specially when determining the first player.
    const ranks = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 2];
    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new Card(rank, suit));
      }
    }
    this.shuffle();
  }

  /**
   * Shuffle the deck in place using the Fisher–Yates algorithm.
   */
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * Draw the top card from the deck.
   * @returns {Card|null}
   */
  draw() {
    return this.cards.pop() || null;
  }
}

class Player {
  constructor(id) {
    this.id = id;
    this.hand = [];
    this.faceUp = [];
    this.faceDown = [];
    this.finished = false;
  }

  /**
   * Determine whether the player currently has any cards left to play.
   * @returns {boolean}
   */
  hasCards() {
    return (
      this.hand.length > 0 ||
      this.faceUp.length > 0 ||
      this.faceDown.length > 0
    );
  }
}

class Game {
  /**
   * Create a new game with the specified number of players.
   *
   * @param {number} numPlayers Between 2 and 5 players is typical.
   */
  constructor(numPlayers = 2) {
    if (numPlayers < 2) throw new Error('At least two players are required');
    this.players = [];
    for (let i = 0; i < numPlayers; i++) {
      this.players.push(new Player(i));
    }
    this.deck = new Deck();
    this.discard = [];
    this.pile = [];
    this.currentPlayer = 0;
    this.direction = 1; // 1 → clockwise, –1 → counter clockwise (not used here but could support reversals)
    this.skipCount = 0; // number of players to skip due to fives
    this.initDeal();
  }

  /**
   * Deal cards and set up face down/up piles.  According to the rules each
   * player receives three face‑down cards, three face‑up cards placed on
   * top of the face‑downs and a hand of three cards.  Players may swap any
   * number of their hand cards with their face‑up cards at the start; by
   * default this implementation automatically keeps lower cards in hand
   * (so that face‑up cards tend to be higher)【577999048044119†L50-L76】.
   */
  initDeal() {
    // Deal three face down cards to each player
    for (let i = 0; i < 3; i++) {
      for (const player of this.players) {
        const card = this.deck.draw();
        if (card) player.faceDown.push(card);
      }
    }
    // Deal three face up cards on top of the face down cards
    for (let i = 0; i < 3; i++) {
      for (const player of this.players) {
        const card = this.deck.draw();
        if (card) player.faceUp.push(card);
      }
    }
    // Deal three cards to each player's hand
    for (let i = 0; i < 3; i++) {
      for (const player of this.players) {
        const card = this.deck.draw();
        if (card) player.hand.push(card);
      }
    }
    // Let players exchange cards: move higher cards to face‑up and keep low
    // cards in hand.  This is a simple heuristic for automated swapping.
    for (const player of this.players) {
      // Sort hand so low cards come first
      player.hand.sort((a, b) => a.rank - b.rank);
      // Sort faceUp so high cards come last
      player.faceUp.sort((a, b) => a.rank - b.rank);
      // If there is a low card in face up and a high card in hand, swap
      for (let j = 0; j < player.hand.length; j++) {
        const handCard = player.hand[j];
        const upCard = player.faceUp[j];
        if (handCard && upCard && handCard.rank > upCard.rank) {
          player.hand[j] = upCard;
          player.faceUp[j] = handCard;
        }
      }
    }
    // Determine the first player: the player who holds the lowest card in
    // their hand (including special cards).  Twos are considered lowest
    // because they can always be played【416014327271259†L118-L125】.
    let lowestRank = Infinity;
    let startingPlayer = 0;
    for (const player of this.players) {
      for (const c of player.hand) {
        const value = c.rank === 2 ? 1 : c.rank;
        if (value < lowestRank) {
          lowestRank = value;
          startingPlayer = player.id;
        }
      }
    }
    this.currentPlayer = startingPlayer;
  }

  /**
   * Retrieve the top non‑eight card in the pile.  Eights are transparent: when
   * an eight has been played the next player must match or beat the card
   * immediately beneath it【416014327271259†L197-L204】.
   *
   * @returns {Card|null}
   */
  topEffectiveCard() {
    for (let i = this.pile.length - 1; i >= 0; i--) {
      const c = this.pile[i];
      if (c.rank !== 8) {
        return c;
      }
    }
    return null;
  }

  /**
   * Determine whether a card can legally be played on the current pile.
   *
   * @param {Card} card
   * @returns {boolean}
   */
  isPlayable(card) {
    const top = this.topEffectiveCard();
    // A ten can always be played and burns the pile
    if (card.rank === 10) return true;
    // A two can always be played and resets the pile
    if (card.rank === 2) return true;
    // An eight is transparent and can always be played
    if (card.rank === 8) return true;
    // Otherwise compare ranks.  If the top card is a seven then the next
    // card must be equal to or below seven; otherwise it must be equal or
    // higher than the top card【656296503652686†L196-L203】.
    if (!top) return true; // empty pile
    if (top.rank === 7) {
      return card.rank <= 7;
    }
    return card.rank >= top.rank;
  }

  /**
   * Check if the last four cards on the pile have the same rank.  If so the
   * pile is burned and removed from play【416014327271259†L118-L131】.
   *
   * @returns {boolean} True if burn occurred.
   */
  checkFourOfAKindBurn() {
    if (this.pile.length < 4) return false;
    const lastRank = this.pile[this.pile.length - 1].rank;
    for (let i = 2; i <= 4; i++) {
      if (this.pile[this.pile.length - i].rank !== lastRank) {
        return false;
      }
    }
    // Burn the pile
    this.discard.push(...this.pile);
    this.pile = [];
    return true;
  }

  /**
   * Execute a turn for the specified player.  The player may lay down one or
   * more cards of the same rank from their current source (hand, faceUp or
   * faceDown).  Alternatively the player may pick up the pile.  This
   * function applies card powers (skip, burn, reset) and advances the
   * current player index accordingly.
   *
   * @param {Player} player Player who is taking the turn.
   * @param {Card[]} playCards Cards the player intends to lay down.  If
   *        undefined or an empty array the player will pick up the pile.
   * @returns {string} A message describing the result of the turn.
   */
  playTurn(player, playCards) {
    if (!player.hasCards()) {
      return `Player ${player.id} has already finished.`;
    }
    // If no cards specified or empty, pick up the pile
    if (!playCards || playCards.length === 0) {
      player.hand.push(...this.pile);
      this.pile = [];
      // Move to next player (the next one after the player who just picked up)
      this.advancePlayer(1);
      return `Player ${player.id} picks up the pile.`;
    }
    // Validate all cards are of the same rank
    const rank = playCards[0].rank;
    for (const c of playCards) {
      if (c.rank !== rank) {
        throw new Error('All played cards must be of the same rank');
      }
    }
    // Check if playable
    for (const c of playCards) {
      if (!this.isPlayable(c)) {
        throw new Error(`Cannot play ${c.toString()} on ${this.topEffectiveCard()}`);
      }
    }
    // Remove these cards from the player's current zone
    this.removeCardsFromPlayer(player, playCards);
    // Place cards on pile
    this.pile.push(...playCards);
    // Apply card powers
    let burn = false;
    let skip = 0;
    let extraTurn = false;
    if (rank === 10) {
      // Burn the pile (discard) and grant another turn
      this.discard.push(...this.pile);
      this.pile = [];
      extraTurn = true;
      burn = true;
    } else if (rank === 2) {
      // Reset the pile (keep the two but treat top as null) and grant another turn
      extraTurn = true;
      // treat as if pile top is empty for next card
    } else if (rank === 5) {
      // Skip as many players as the number of fives played
      skip = playCards.length;
    }
    // Check four of a kind burn (if not already burned by ten)
    if (!burn && this.checkFourOfAKindBurn()) {
      extraTurn = true;
      burn = true;
    }
    // Replenish player's hand up to three cards from the deck if possible
    this.replenishHand(player);
    // If the player has emptied their hand, move on to face up or face down cards
    if (player.hand.length === 0 && player.faceUp.length > 0) {
      // Move all face up cards into hand for play
      player.hand.push(...player.faceUp);
      player.faceUp = [];
    }
    if (player.hand.length === 0 && player.faceUp.length === 0 && player.faceDown.length > 0) {
      // Draw one blind card from faceDown and add to hand
      const blind = player.faceDown.pop();
      if (blind) player.hand.push(blind);
    }
    // If after playing and drawing the player has no cards anywhere they finish
    if (!player.hasCards()) {
      player.finished = true;
    }
    // Determine next player index accounting for skips and extra turn
    if (player.finished) {
      // Skip finished players
      this.advancePlayer(1);
    } else if (extraTurn) {
      // Same player gets another turn
      // no change to currentPlayer
    } else {
      this.advancePlayer(1 + skip);
    }
    return `Player ${player.id} plays ${playCards.map(c => c.toString()).join(', ')}${burn ? ' and burns the pile' : ''}${skip > 0 ? ' and skips ' + skip + ' player(s)' : ''}${extraTurn && !burn && rank === 2 ? ' and resets the pile' : ''}.`;
  }

  /**
   * Remove the specified cards from the player's hand/faceUp/faceDown.
   * @param {Player} player
   * @param {Card[]} cards
   */
  removeCardsFromPlayer(player, cards) {
    // Try to remove from hand first
    for (const c of cards) {
      let idx = player.hand.findIndex(x => x === c);
      if (idx >= 0) {
        player.hand.splice(idx, 1);
        continue;
      }
      idx = player.faceUp.findIndex(x => x === c);
      if (idx >= 0) {
        player.faceUp.splice(idx, 1);
        continue;
      }
      idx = player.faceDown.findIndex(x => x === c);
      if (idx >= 0) {
        player.faceDown.splice(idx, 1);
      }
    }
  }

  /**
   * Draw cards for the player until they hold at least three cards in hand or
   * the deck is empty【416014327271259†L118-L123】.  This is called after a player has
   * played their cards during a normal turn.
   *
   * @param {Player} player
   */
  replenishHand(player) {
    while (player.hand.length < 3 && this.deck.cards.length > 0) {
      const card = this.deck.draw();
      if (card) player.hand.push(card);
    }
  }

  /**
   * Advance the currentPlayer pointer by n positions, skipping finished
   * players.  Direction is always clockwise in this version.
   *
   * @param {number} n Number of players to advance.
   */
  advancePlayer(n) {
    const total = this.players.length;
    let idx = this.currentPlayer;
    let steps = n;
    while (steps > 0) {
      idx = (idx + 1) % total;
      if (!this.players[idx].finished) {
        steps--;
      }
    }
    this.currentPlayer = idx;
  }
}

// Example usage: play a two player game in the terminal.  This can be
// executed with `node game.js` to simulate a simple round between a human
// (player 0) and a basic AI (player 1).  To keep the example concise the
// AI always plays the lowest playable card and picks up when it has no
// playable cards.  Remove or replace this section when integrating into
// your own UI or networking layer.
if (require.main === module) {
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const g = new Game(2);
  function promptPlayer() {
    const p = g.players[g.currentPlayer];
    if (p.finished) {
      if (g.players.every(pl => pl.finished || pl === p)) {
        console.log(`Game over! Player ${p.id} wins.`);
        process.exit(0);
      }
      g.advancePlayer(1);
      promptPlayer();
      return;
    }
    // Build a list of playable cards from hand
    const playable = [];
    const handCounts = {};
    for (const c of p.hand) {
      if (g.isPlayable(c)) {
        if (!handCounts[c.rank]) handCounts[c.rank] = [];
        handCounts[c.rank].push(c);
      }
    }
    console.log(`\nTop of pile: ${g.pile.map(c => c.toString()).join(', ') || '(empty)'}`);
    console.log(`Player ${p.id}'s turn. Hand: ${p.hand.map(c => c.toString()).join(', ')}`);
    if (Object.keys(handCounts).length === 0) {
      console.log('No playable cards. You must pick up or pass.');
      g.playTurn(p, []);
      promptPlayer();
      return;
    }
    // Show options grouped by rank
    console.log('Playable options:');
    const options = [];
    let idx = 0;
    for (const rankKey of Object.keys(handCounts).sort((a, b) => Number(a) - Number(b))) {
      const cards = handCounts[rankKey];
      options.push(cards);
      const names = cards.map(c => c.toString()).join(', ');
      console.log(`  ${idx}: ${names}`);
      idx++;
    }
    rl.question('Select option or press Enter to pick up: ', answer => {
      const choice = parseInt(answer, 10);
      if (isNaN(choice) || choice < 0 || choice >= options.length) {
        g.playTurn(p, []);
      } else {
        g.playTurn(p, options[choice]);
      }
      promptPlayer();
    });
  }
  promptPlayer();
}

module.exports = { Game, Player, Card };