import { Utils } from '@neoxr/wb'

const DROPABLE_RESOURCES = [
   'potion', 'wood', 'rock', 'iron', 'string', 'diamond', 'emerald', 'gold',
   'trash', 'thread', 'legendary', 'mythic', 'superior', 'common', 'uncommon',
   'fish', 'bone', 'carrot', 'rat', 'fire'
]

const ENEMIES = ['Slime', 'Goblin', 'Skeleton', 'Orc', 'Zombie', 'Wraith', 'Bandit', 'Dragon', 'Demon']
const BOSSES = ['Dragon King', 'Demon Lord', 'Ancient Golem', 'Shadow Beast']

/**
 * Simulates a dungeon for a player.
 * Created by Neoxr Creative
 */
export default class Dungeon {
   constructor(player) {
      this.player = player
      this.floor = 1
      this.maxFloor = 8
      this.completed = false
      this.log = []
      this.baseScore = 0
      this.minExp = 500
      this.minHealth = 100
      this.minStamina = 10
   }

   /**
    * Get the enemy and resource loot for the current floor.
    */
   getFloorData(floor) {
      const enemyCount = Math.floor(Math.random() * 2) + 1
      const enemies = Array.from({ length: enemyCount }, () => this.randomEnemy(ENEMIES))
      if (floor === 8) {
         enemies.push(this.randomEnemy(BOSSES))
      }
      return {
         enemies,
         boss: floor === this.maxFloor
      }
   }

   /**
    * Choose a random enemy or item from a list.
    */
   randomEnemy(list) {
      return list[Math.floor(Math.random() * list.length)]
   }

   /**
    * Generate random resource loot.
    */
   generateResourceLoot() {
      const count = Math.floor(Math.random() * 3) + 1
      const loot = []
      for (let i = 0; i < count; i++) {
         const key = this.randomEnemy(DROPABLE_RESOURCES)
         const qty = Math.floor(Math.random() * 5) + 1
         loot.push({ key, qty })
      }
      return loot
   }

   /**
    * Check if player meets minimum requirements for exp, health, and stamina.
    */
   checkMinimumRequirements() {
      const { exp, health, stamina } = this.player
      if (exp < this.minExp) {
         this.log.push(`❌ EXP terlalu rendah untuk melanjutkan. Dibutuhkan minimal ${this.minExp} EXP.`)
         return false
      }
      if (health < this.minHealth) {
         this.log.push(`❌ Persentase health terlalu rendah untuk melanjutkan. Dibutuhkan minimal ${this.minHealth}%.`)
         return false
      }
      if (stamina < this.minStamina) {
         this.log.push(`❌ Stamina terlalu rendah untuk melanjutkan. Dibutuhkan minimal ${this.minStamina} Stamina.`)
         return false
      }
      return true
   }

   /**
    * Simulate the battle and resource reward.
    */
   battleAndLoot() {
      const expLoss = Math.floor(Math.random() * 50)
      const staminaLoss = Math.floor(Math.random() * 7)
      const healthLoss = Math.floor(Math.random() * 50) + 20

      this.player.exp = Math.max(0, this.player.exp - expLoss)
      this.player.stamina = Math.max(0, this.player.stamina - staminaLoss)
      this.player.health = Math.max(0, this.player.health - healthLoss)

      this.log.push(`⚔️ Bertarung... (-${staminaLoss} stamina, -${healthLoss} health)`)

      if (this.player.health <= 0 || this.player.stamina <= 0) {
         this.log.push(`💀 Kamu tewas di lantai ${this.floor}...`)
         return { status: false, msg: 'Kamu gagal menyelesaikan dungeon.', defeated: true }
      }

      const loot = this.generateResourceLoot()
      loot.forEach(item => {
         if (!this.player.resource[item.key]) this.player.resource[item.key] = 0
         this.player.resource[item.key] += item.qty
      })

      this.log.push(`📦 Loot : ${loot.map(x => `+${x.qty} ${x.key}`).join(', ')}`)

      if (this.floor === this.maxFloor) {
         this.completed = true
         return { status: true, msg: 'Dungeon selesai!', loot, completed: true }
      }

      this.floor++
      return { status: true, msg: `Naik ke lantai ${this.floor}`, loot }
   }

   /**
    * Calculate the score based on player's performance.
    */
   calculateScore() {
      const { exp, health, stamina, agility } = this.player
      let score = Math.floor((exp / 100) + (health / 10) + (stamina / 10) + (agility * 2))
      score += this.floor * 50
      this.baseScore = score
      this.player.exp += score
      return score
   }

   /**
    * Determine the player's rating based on their score.
    */
   getRating(score) {
      if (score >= 5000) return 'S+'
      if (score >= 4000) return 'S'
      if (score >= 3000) return 'A+'
      if (score >= 2000) return 'A'
      return 'B'
   }

   /**
    * Run the dungeon adventure from start to finish.
    */
   run() {
      const result = this.enter()
      if (!result.status) return result

      while (!this.completed) {
         if (this.floor === 1 && !this.checkMinimumRequirements()) {
            return {
               status: false,
               msg: 'Kamu gagal melanjutkan ke lantai berikutnya karena tidak memenuhi persyaratan minimum.',
               summary: {
                  exp: this.player.exp,
                  health: this.player.health,
                  stamina: this.player.stamina,
                  agility: this.player.agility
               }
            }
         }

         const battle = this.battleAndLoot()
         if (battle.defeated) {
            return {
               status: false,
               msg: 'Kamu gagal menyelesaikan dungeon.',
               summary: {
                  exp: this.player.exp,
                  health: this.player.health,
                  stamina: this.player.stamina,
                  agility: this.player.agility
               }
            }
         }

         if (!this.completed) this.enter()
      }

      const score = this.calculateScore()
      const rating = this.getRating(score)
      const lootSummary = this.generateResourceLoot().map(x => `+${x.qty} ${x.key}`).join(', ')
      this.log.push(`🏆 Dungeon selesai! Kamu berhasil menaklukkan semua lantai. Skor akhir: ${Utils.formatter(score)} (${rating})`)

      return {
         status: this.completed,
         msg: `🏆 Dungeon selesai! Kamu berhasil menaklukkan semua lantai.`,
         score,
         rating,
         lootSummary,
         summary: {
            exp: this.player.exp,
            health: this.player.health,
            stamina: this.player.stamina,
            agility: this.player.agility
         }
      }
   }

   /**
    * Simulate entering the dungeon.
    */
   enter() {
      if (this.completed)
         return { status: false, msg: 'Dungeon sudah diselesaikan.' }

      const data = this.getFloorData(this.floor)
      this.log.push(`\n\n📍 Memasuki lantai ke-${this.floor}`)
      this.log.push(`👾 Musuh yang muncul: ${data.enemies.join(', ')}`)
      return { status: true, msg: `Lantai ${this.floor} dimulai.`, data }
   }

   /**
    * Get the action logs.
    */
   getLog() {
      return this.log
   }
}
