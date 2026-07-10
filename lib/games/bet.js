import { USD } from './rpg-utils.js'

/**
 * GameBet class manages a multiplayer or solo betting game where players pick numbers from 1 to 9.
 * One hidden winning number is randomly assigned, and players must try to pick it.
 * The winner receives the total pot. In solo mode, reward is multiplied randomly.
 * 
 * Created by Neoxr Creative
 */
export default class GameBet {
   constructor(room, timeout = 15_000) {
      this.room = room
      this.players = []
      this.bets = {}
      this.choices = {}
      this.timeout = timeout
      this.board = Array(9).fill(null).map((_, i) => `${i + 1}`)
      this.hidden = {}
      this.started = false
      this.totalPot = 0
      this.currentIndex = 0
      this.timer = null
      this.log = []
      this.message = {}
      this.winner = null
      this.callback = null
   }

   /**
    * Adds a player to the game with a bet amount.
    * Validates if the game hasn't started and if the bet meets the minimum requirement.
    * @param {string} playerId - The identifier of the player.
    * @param {number} amount - The bet amount.
    * @returns {object} Join result with status and message.
    */
   join(playerId, amount) {
      if (this.started) return { status: true, msg: 'Permainan sudah dimulai' }
      if (amount < 500) return { status: false, msg: `Uang taruhan minimal ${USD.format(500)}` }
      if (this.players.includes(playerId)) return { status: true, msg: 'Kamu sudah bergabung' }
      this.players.push(playerId)
      this.bets[playerId] = amount
      this.totalPot += parseInt(amount)
      return { status: true, msg: `${playerId} bergabung dengan taruhan ${USD.format(amount)}` }
   }

   /**
    * Starts the game. Initializes the hidden board and determines solo or multi-player mode.
    * Triggers the turn or immediately proceeds in solo mode.
    * @param {function} callback - A function to call on each game state update.
    * @returns {object|undefined} The solo mode message if applicable.
    */
   start(callback) {
      if (this.players.length === 0) return { status: false, msg: 'Tidak ada pemain bergabung' }
      this.started = true
      this.callback = callback
      const luckyNumber = Math.floor(Math.random() * 9)
      for (let i = 0; i < 9; i++) {
         this.hidden[i + 1] = i === luckyNumber ? '😁' : '😡'
      }

      if (this.players.length === 1) {
         let msg = `乂  *B E T*\n\n`
         msg += `*Mode* : SOLO (#${this.room})\n`
         msg += `Total uang taruhan : *${USD.format(this.totalPot)}*\n`
         msg += `Pilih angka di bawah ini :\n\n`
         msg += `${this.#renderBoard()}\n`
         msg += `Silahkan ${this.players[0]} reply pesan untuk memilih angka.`
         const message = {
            mode: 'solo',
            msg,
            board: this.#renderBoard(),
            turn: this.players[0]
         }
         this.message = message
         return callback(message)
      } else {
         this.#nextTurn()
      }
   }

   /**
    * Internal method to proceed to the next player's turn.
    * If all players have taken their turns, shows the result.
    * Otherwise, sets a timeout and prepares the next message.
    * @private
    */
   #nextTurn() {
      if (this.currentIndex >= this.players.length) {
         const result = this.#showResult()
         if (this.callback) this.callback({ result })
         return
      }

      const player = this.players[this.currentIndex]
      const board = this.#renderBoard()

      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
         this.choices[player] = null
         this.log.push(`${player} kehabisan waktu`)
         this.currentIndex++
         this.#nextTurn()
      }, this.timeout)

      if (this.callback) {
         let msg = `乂  *B E T*\n\n`
         msg += `*Mode* : MULTI (#${this.room})\n`
         msg += `Total uang taruhan : *${USD.format(this.totalPot)}*\n`
         msg += `Pilih angka di bawah ini :\n\n`
         msg += `${board}\n`
         msg += `Silahkan ${player} reply pesan untuk memilih angka.`
         const message = {
            mode: 'multi',
            msg,
            board,
            turn: player
         }
         this.message = message
         this.callback(message)
      }
   }

   /**
    * Handles player's number selection.
    * Validates the turn and checks if the number is available.
    * @param {string} playerId - The player making the choice.
    * @param {number} number - The number chosen (1-9).
    * @param {function} callback - Optional callback for solo result.
    * @returns {object} Result of the pick operation.
    */
   pick(playerId, number, callback) {
      if (!this.started) return { status: false, msg: 'Game belum dimulai.' }
      if (!this.players.includes(playerId)) return { status: false, msg: 'Kamu belum join.' }

      const isSolo = this.players.length === 1
      const validTurn = this.players[this.currentIndex]

      if (!isSolo && playerId !== validTurn) return { status: false, msg: 'Bukan giliranmu.' }
      if (this.choices[playerId] !== undefined) return { status: false, msg: 'Kamu sudah memilih.' }
      if (this.board[number - 1] === '📌') return { status: false, msg: 'Angka sudah dipilih.' }
      if (number < 1 || number > 9) return { status: false, msg: 'Angka tidak valid.' }

      this.board[number - 1] = '📌'
      this.choices[playerId] = number
      this.log.push(`${playerId} memilih angka ${number}`)

      if (isSolo) {
         const result = this.#showResult()
         if (callback) callback(result)
         return result
      } else {
         this.currentIndex++
         this.#nextTurn()
         return { status: true, msg: `${playerId} memilih angka ${number}.` }
      }
   }

   /**
    * Internal method to evaluate all player choices and determine the winner.
    * Builds a result message and returns final game summary.
    * @private
    * @returns {object} Final game result, including winner, reward, and rendered board.
    */
   #showResult() {
      clearTimeout(this.timer)
      let result = `乂  *B E T*\n\n`
      const isSolo = this.players.length === 1
      let reward = 0

      const allSkipped = Object.keys(this.choices).length === 0
      if (allSkipped) {
         this.started = false
         return {
            status: true,
            msg: `Permainan dibatalkan karena semua pemain tidak memilih angka.`,
            winner: null,
            reward: 0,
            board: this.#renderBoard(),
            final: this.#renderFinalBoard()
         }
      }

      result += `*Mode* : ${isSolo ? 'SOLO' : 'MULTI'}\n`
      result += `Total uang taruhan : *${USD.format(this.totalPot)}*\n`
      result += `Berikut adalah hasil akhirnya :\n\n`
      result += `${this.#renderFinalBoard()}\n`

      for (const player of this.players) {
         const pick = this.choices[player]
         if (!pick) {
            result += `▦ ${player} tidak memilih angka! (- ${USD.format(this.bets[player])})\n`
            continue
         }

         const content = this.hidden[pick]
         if (content === '😁') {
            if (isSolo) {
               const multiplier = Math.floor(Math.random() * 3) + 1
               reward = this.bets[player] * multiplier
               this.winner = player
               result += `▦ ${player} mendapatkan ${content} (+${USD.format(reward)})\n`
            } else {
               reward = this.totalPot
               this.winner = player
               result += `▦ ${player} mendapatkan ${content} (+${USD.format(reward)})\n`
            }
         } else {
            result += `▦ ${player} mendapatkan ${content} (- ${USD.format(this.bets[player])})\n`
         }
      }

      this.started = false
      return {
         status: true,
         msg: result,
         winner: this.winner,
         reward,
         board: this.#renderBoard(),
         final: this.#renderFinalBoard()
      }
   }

   /**
    * Renders the current game board with emoji representations.
    * @private
    * @returns {string} Rendered board as string.
    */
   #renderBoard() {
      const emojiMap = {
         '1': '1️⃣', '2': '2️⃣', '3': '3️⃣',
         '4': '4️⃣', '5': '5️⃣', '6': '6️⃣',
         '7': '7️⃣', '8': '8️⃣', '9': '9️⃣',
         '📌': '📌'
      }

      return this.board
         .map(v => emojiMap[v] || v)
         .reduce((acc, val, i) => {
            acc += val
            if ((i + 1) % 3 === 0) acc += '\n'
            return acc
         }, '')
   }

   /**
    * Renders the final board revealing all hidden emojis.
    * @private
    * @returns {string} Rendered final board as string.
    */
   #renderFinalBoard() {
      return this.board.map((_, i) => {
         return this.hidden[i + 1]
      }).reduce((acc, val, i) => {
         acc += val
         if ((i + 1) % 3 === 0) acc += '\n'
         return acc
      }, '')
   }

   /**
    * Public method to manually end the game and show result.
    * Useful as a fallback if timeout or issues occur.
    * @returns {object} Game result.
    */
   endGame() {
      return this.#showResult()
   }
}