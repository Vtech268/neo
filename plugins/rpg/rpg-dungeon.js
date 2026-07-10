import Dungeon from '../../lib/games/dungeon.js'

export const run = {
   usage: ['dungeon'],
   category: 'rpg',
   async: async (m, {
      client,
      players,
      Utils
   }) => {
      try {
         const cooldown = 60 * 1000 * 1
         const timeout = new Date(players.last.dungeon + cooldown) - new Date()
         if (new Date - players.last.dungeon > cooldown) {
            m.react('🕹')
            players.last.dungeon = +new Date()
            const dungeon = new Dungeon(players)
            dungeon.run()
            const logs = dungeon.getLog().join('\n')?.trim()?.split('\n\n')
            for (const log of logs) {
               await Utils.delay(5000)
               m.reply(log?.trim())
            }
         } else {
            const fn = Utils.readTime(timeout)
            const addZero = i => i < 10 ? '0' + i : i.toString()
            client.reply(m.chat, `❌ Silahkan tunggu *${fn.minutes} menit* lagi : *(${addZero(fn.minutes)}:${addZero(fn.seconds)})*`, m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   limit: true,
   game: true
}