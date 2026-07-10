import { generateAction } from './rpg-utils.js'

/**
 * Turn-based Tournament Game Engine
 * 
 * This module defines the TurnGame class for handling a multiplayer, turn-based
 * Tournament game. The game supports battle system. It supports turn rotation, player elimination by health or inactivity,
 * stamina-based skill usage, and game ending logic including draw detection.
 * 
 * Created by Neoxr Creative
 */

export default class Tournament {
   /**
    * @param {string} room - Room identifier.
    * @param {Array<Object>} players - List of players with stats and skills.
    */
   constructor(room, players = []) {
      this.room = room
      this.players = players.map(p => ({
         skipTurn: 0,
         eliminatedBySkip: false,
         eliminated: false,
         ...p
      }))
      this.index = 0
      this.running = false
      this.log = []
      this.auto = false
      this.ended = false
      this.timeout = null
      this.TURN_TIMEOUT = 15000 // ms
   }

   /**
    * Enables or disables automatic mode.
    * @param {boolean} isAuto - Whether auto mode should be enabled.
    */
   setAutoMode(isAuto = false) {
      this.auto = isAuto
   }

   /**
    * Retrieves the current player whose turn it is.
    * @returns {Object|null} The current player object or null if no player is eligible.
    */
   getCurrentPlayer() {
      const total = this.players.length
      for (let i = 0; i < total; i++) {
         const p = this.players[this.index]
         if (p && p.health > 0 && !p.eliminated) return p
         this.index = (this.index + 1) % total
      }
      return null
   }

   /**
    * Retrieves the next player for the upcoming turn.
    * @returns {Object|null} The next player object or null if no player is eligible.
    */
   getNextPlayer() {
      const total = this.players.length
      for (let i = 1; i <= total; i++) {
         const next = this.players[(this.index + i) % total]
         if (next && next.health > 0 && !next.eliminated) return next
      }
      return null
   }

   /**
    * Advances to the next turn by updating the current player index.
    */
   nextTurn() {
      const total = this.players.length
      for (let i = 1; i <= total; i++) {
         const nextIndex = (this.index + i) % total
         const next = this.players[nextIndex]
         if (next?.health > 0 && !next.eliminated) {
            this.index = nextIndex
            return
         }
      }
   }

   /**
    * Checks whether the game is over based on player health and elimination status.
    * @returns {boolean} True if the game is over, false otherwise.
    */
   isGameOver() {
      return this.players.filter(p => p.health > 0 && !p.eliminated).length <= 1
   }

   /**
    * Determines if the game resulted in a draw.
    * @returns {boolean} True if the game is a draw, false otherwise.
    */
   isDraw() {
      return this.players.filter(p => p.health > 0 && !p.eliminatedBySkip).length === 0
   }

   /**
    * Retrieves the winner of the game if applicable.
    * @returns {Object|null} The winning player object or null if no winner is determined.
    */
   getWinner() {
      if (!this.isGameOver()) return null
      const alive = this.players.filter(p => p.health > 0 && !p.eliminated && !p.eliminatedBySkip)
      return alive.length === 1 ? alive[0] : null
   }

   /**
    * Eliminates a player based on their unique identifier (jid).
    * @param {string} jid - The unique identifier of the player to eliminate.
    */
   eliminatePlayer(jid) {
      const player = this.players.find(p => p.jid === jid)
      if (player) {
         player.health = 0
         player.eliminated = true
      }
   }

   /**
    * Handles the attack action between players.
    * @param {string} attackerJid - The unique identifier of the attacking player.
    * @param {number} targetIndex - The index of the target player in the players array.
    * @param {number} skillIndex - The index of the skill being used in the attacker's skills array.
    * @returns {Object} An object indicating the result of the attack.
    */
   attack(attackerJid, targetIndex, skillIndex) {
      const attacker = this.players.find(p => p.jid === attackerJid)
      const target = this.players[targetIndex]
      const current = this.getCurrentPlayer()

      if (!attacker || !target)
         return { status: false, msg: 'Pemain tidak ditemukan' }

      if (attacker.health <= 0 || attacker.eliminated)
         return { status: false, msg: 'Kamu sudah dieliminasi' }

      if (attacker.jid !== current?.jid)
         return { status: false, msg: 'Bukan giliranmu' }

      if (attacker.jid === target.jid)
         return { status: false, msg: 'Kamu tidak bisa menyerang diri sendiri!' }

      const skill = attacker.skills?.[skillIndex]
      if (!skill)
         return { status: false, msg: 'Skill tidak ditemukan' }

      if (attacker.stamina < skill.cost) {
         const availableSkills = attacker.skills
            .filter(s => s.cost <= attacker.stamina)
            .map(s => s.name)

         if (availableSkills.length === 0) {
            attacker.eliminatedBySkip = true
            this.eliminatePlayer(attacker.jid)

            const msg = `@${attacker.jid.replace(/@.+/, '')} tidak punya stamina dan dieliminasi.`
            this.log.push(msg)

            const winner = this.getWinner()
            this.running = !winner
            if (winner) {
               return {
                  status: true,
                  msg,
                  action: [...this.log],
                  players: this.players,
                  winner: winner.jid,
                  turn: null
               }
            }

            this.nextTurn()
            return {
               status: true,
               msg,
               action: [...this.log],
               players: this.players,
               winner: null,
               turn: this.getCurrentPlayer()?.jid
            }
         }

         return {
            status: true,
            msg: `Stamina tidak cukup. Gunakan skill lain: ${availableSkills.join(', ')}`,
            action: [...this.log],
            players: this.players,
            winner: null,
            turn: this.getCurrentPlayer()?.jid
         }
      }

      const dodgeChance = target.agility || 0
      const isDodged = Math.random() * 100 < dodgeChance

      attacker.stamina -= skill.cost

      if (isDodged) {
         const agiLoss = Math.floor(Math.random() * 10)
         target.agility = Math.max(0, target.agility - agiLoss)

         const msg = `@${target.jid.replace(/@.+/, '')} berhasil menghindari serangan dari @${attacker.jid.replace(/@.+/, '')}!`
         this.log.push(msg)
         const winner = this.getWinner()
         this.running = !winner
         if (!winner) this.nextTurn()

         return {
            status: true,
            msg,
            action: [...this.log],
            players: this.players,
            winner: winner?.jid || null,
            turn: winner ? null : this.getCurrentPlayer()?.jid
         }
      } else {
         const damage = Math.max(1, skill.baseDamage + attacker.strength - target.defense)
         target.health -= damage

         const expLoss = Math.floor(Math.random() * 50000)
         const defLoss = Math.floor(Math.random() * 3)
         const luckLoss = Math.floor(Math.random() * 2)

         target.exp = Math.max(0, target.exp - expLoss)
         target.defense = Math.max(0, target.defense - defLoss)
         target.lucky = Math.max(0, target.lucky - luckLoss)

         this.log.push(
            `${generateAction(`@${attacker.jid.replace(/@.+/, '')}`, `@${target.jid.replace(/@.+/, '')}`, `${skill.name}`)} Damage dealt ${damage} (-${expLoss} exp, -${defLoss} def, -${luckLoss} luck)`
         )
      }

      if (target.health <= 0) {
         this.eliminatePlayer(target.jid)
         const targetMention = `@${target.jid.replace(/@.+/, '')}`
         this.log.push(`${targetMention} telah dieliminasi.`)

         const winner = this.getWinner()
         this.running = !winner
         return {
            status: false,
            msg: `${targetMention} telah mati.`,
            winner: winner?.jid || null,
            action: [...this.log],
            players: this.players,
            turn: winner ? null : this.getCurrentPlayer()?.jid
         }
      }

      if (attacker.stamina <= 0 || attacker.health <= 0) {
         this.eliminatePlayer(attacker.jid)
         const attackerMention = `@${attacker.jid.replace(/@.+/, '')}`
         this.log.push(`${attackerMention} telah dieliminasi karena kehabisan stamina atau HP.`)

         const winner = this.getWinner()
         this.running = !winner
         return {
            status: false,
            msg: `${attackerMention} dieliminasi.`,
            winner: winner?.jid || null,
            action: [...this.log],
            players: this.players,
            turn: winner ? null : this.getCurrentPlayer()?.jid
         }
      }

      const winner = this.getWinner()
      this.running = !winner
      if (!winner) this.nextTurn()

      return {
         status: true,
         msg: `@${attacker.jid.replace(/@.+/, '')} menyerang @${target.jid.replace(/@.+/, '')} menggunakan ${skill.name}`,
         action: [...this.log],
         players: this.players,
         winner: winner?.jid || null,
         turn: winner ? null : this.getCurrentPlayer()?.jid
      }
   }

   /**
    * Starts a turn for the current player and schedules timeout actions.
    * @param {Function} callback - Callback function to handle turn-based logic.
    */
   startTurn(callback) {
      if (this.ended) {
         this.running = false
         return
      }

      if (!this.running || this.players.length === 0) {
         this.ended = true
         this.running = false
         return callback({ status: false, msg: 'Game belum dimulai atau tidak ada pemain.' })
      }

      this.players.forEach(player => {
         if (!player.eliminated && player.stamina <= 0) {
            player.skipTurn += 1
            if (player.skipTurn >= 3) {
               player.eliminated = true
               player.eliminatedBySkip = true
               this.log.push(`@${player.jid.replace(/@.+/, '')} dieliminasi karena 3x skip`)
            }
         }
      })

      const alivePlayers = this.players.filter(p => !p.eliminated && p.health > 0)

      if (alivePlayers.length === 0 || this.isDraw()) {
         this.ended = true
         this.running = false
         return callback({ status: false, msg: 'permainan selesai, tidak ada yang menang dan kalah', winner: null, draw: true })
      }

      if (alivePlayers.length === 1) {
         const winner = alivePlayers[0]
         if (winner.eliminatedBySkip || winner.stamina <= 0) {
            this.ended = true
            this.running = false
            return callback({ status: false, msg: 'permainan selesai, tidak ada yang menang dan kalah', winner: null, draw: true })
         }
         this.ended = true
         this.running = false
         return callback({ status: false, msg: `Permainan berakhir. Pemenang: @${winner.jid.split('@')[0]}`, winner: winner.jid, draw: false })
      }

      let current = this.getCurrentPlayer()
      let attempts = 0

      while ((current?.eliminated || current?.stamina <= 0) && attempts < this.players.length) {
         this.nextTurn()
         current = this.getCurrentPlayer()
         attempts++
      }

      if (!current || attempts >= this.players.length) {
         this.ended = true
         this.running = false
         return callback({ status: false, msg: 'permainan selesai, tidak ada yang menang dan kalah', winner: null, draw: true })
      }

      const message = this.log.length > 0
         ? `Giliran @${current.jid.split('@')[0]} untuk menyerang`
         : `@${current.jid.split('@')[0]} mendapat giliran pertama untuk menyerang`

      this.log.push(message)

      callback({
         status: true,
         msg: message,
         jid: current.jid
      })

      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
         current.skipTurn += 1
         this.log.push(`@${current.jid.replace(/@.+/, '')} tidak melakukan aksi dalam ${this.TURN_TIMEOUT / 1000} detik (${current.skipTurn}x skip).`)

         if (current.skipTurn > 2) {
            current.eliminated = true
            current.eliminatedBySkip = true
            this.log.push(`@${current.jid.replace(/@.+/, '')} dieliminasi karena tidak menyerang.`)
         }

         this.nextTurn()
         if (this.auto) this.startTurn(callback)
      }, this.TURN_TIMEOUT)
   }
}