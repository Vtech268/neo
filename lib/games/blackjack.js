/**
 * Blackjack class manages a multiplayer or solo card game where players compete against a dealer.
 * Players aim to have a hand value closer to 21 than the dealer without exceeding it.
 * Features automated dealer logic and turn-based player management.
 * 
 * Created by Neoxr Creative
 */
export default class Blackjack {
   /**
    * Initializes a new Blackjack game session.
    * @param {string} id - Unique session identifier.
    * @param {number} timeout - Session duration before expiration.
    */
   constructor(id, timeout) {
      this.id = id
      this.timeout = timeout
      this.started = false
      this.players = []
      this.bets = {}
      this.hands = {}
      this.status = {} // 'playing', 'stand', 'bust'
      this.dealerHand = []
      this.deck = this.createDeck()
      this.currentTurnIndex = 0
   }

   /**
    * Generates and shuffles a standard 52-card deck.
    * @returns {Array} Shuffled array of card objects containing suit and value.
    */
   createDeck() {
      const suits = ['♠️', '♥️', '♣️', '♦️']
      const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
      let deck = []
      for (let s of suits) {
         for (let v of values) deck.push({ suit: s, value: v })
      }
      return deck.sort(() => Math.random() - 0.5)
   }

   /**
    * Calculates the numeric value of a hand, dynamically treating Aces as 1 or 11.
    * @param {Array} hand - The collection of cards to evaluate.
    * @returns {number} The optimized total score.
    */
   calculateScore(hand) {
      let score = 0
      let aces = 0
      for (let card of hand) {
         if (card.value === 'A') { aces += 1; score += 11 }
         else if (['J', 'Q', 'K'].includes(card.value)) score += 10
         else score += parseInt(card.value)
      }
      while (score > 21 && aces > 0) { score -= 10; aces -= 1 }
      return score
   }

   /**
    * Adds a new player to the game session before it starts.
    * @param {string} jid - Player's unique WhatsApp ID.
    * @param {number} amount - The amount of currency being wagered.
    * @returns {Object} Success status and error message if applicable.
    */
   join(jid, amount) {
      if (this.started) return { status: false, msg: 'Permainan sudah dimulai.' }
      if (this.players.includes(jid)) return { status: false, msg: 'Kamu sudah bergabung.' }
      this.players.push(jid)
      this.bets[jid] = parseInt(amount)
      this.status[jid] = 'playing'
      return { status: true }
   }

   /**
    * Initiates the game by dealing dua cards to all players and the dealer.
    */
   start() {
      this.started = true
      this.dealerHand = [this.deck.pop(), this.deck.pop()]
      for (let jid of this.players) {
         this.hands[jid] = [this.deck.pop(), this.deck.pop()]
         if (this.calculateScore(this.hands[jid]) === 21) this.status[jid] = 'stand'
      }
      this.findNextActivePlayer()
   }

   /**
    * Gets the ID of the player who is currently required to make a move.
    * @returns {string|null} The JID of the active player.
    */
   getCurrentPlayer() {
      if (this.currentTurnIndex >= this.players.length) return null
      return this.players[this.currentTurnIndex]
   }

   /**
    * Moves the turn pointer to the next player who has not yet finished their turn.
    */
   findNextActivePlayer() {
      while (this.currentTurnIndex < this.players.length && this.status[this.players[this.currentTurnIndex]] !== 'playing') {
         this.currentTurnIndex++
      }
   }

   /**
    * Executes a 'Hit' action, drawing one card for the specified player.
    * @param {string} jid - The ID of the player drawing the card.
    * @returns {Object} Action results including the drawn card.
    */
   hit(jid) {
      if (jid !== this.getCurrentPlayer()) return { status: false, msg: 'Bukan giliranmu.' }
      const card = this.deck.pop()
      this.hands[jid].push(card)
      const score = this.calculateScore(this.hands[jid])

      if (score >= 21) {
         this.status[jid] = score > 21 ? 'bust' : 'stand'
         this.currentTurnIndex++
         this.findNextActivePlayer()
      }
      return { status: true, card, score }
   }

   /**
    * Executes a 'Stand' action, ending the specified player's turn.
    * @param {string} jid - The ID of the player ending their turn.
    * @returns {Object} Action results.
    */
   stand(jid) {
      if (jid !== this.getCurrentPlayer()) return { status: false, msg: 'Bukan giliranmu.' }
      this.status[jid] = 'stand'
      this.currentTurnIndex++
      this.findNextActivePlayer()
      return { status: true }
   }

   /**
    * Formats the current state of the game into a readable string for the chat.
    * @param {boolean} isFinal - If true, reveals the dealer's hidden card and total score.
    * @returns {string} The formatted game table.
    */
   renderTable(isFinal = false) {
      let text = `乂  *B L A C K J A C K*\n\n`
      const dScore = this.calculateScore(this.dealerHand)
      text += `*Dealer* : ${isFinal ? this.dealerHand.map(c => c.value + c.suit).join(' ') + ` (${dScore})` : '?? ' + this.dealerHand[1].value + this.dealerHand[1].suit}\n`
      text += `--------------------------\n`
      for (let jid of this.players) {
         const score = this.calculateScore(this.hands[jid])
         const isTurn = !isFinal && jid === this.getCurrentPlayer()
         text += `${isTurn ? '▪' : '▫'} @${jid.split('@')[0]} : ${this.hands[jid].map(c => c.value + c.suit).join(' ')} (${score}) [${this.status[jid].toUpperCase()}]\n`
      }
      return text
   }
}