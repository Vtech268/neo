import { models } from '../../lib/system/models.js'

export const run = {
   usage: ['fixdb'],
   category: 'operator',
   async: async (m, {
      Utils
   }) => {
      try {
         const isObject = (item) => (item && typeof item === 'object' && !Array.isArray(item))

         const validate = (target, source) => {
            if (!target || !source) return
            for (const key in source) {
               if (isObject(source[key])) {
                  if (!target[key] || !isObject(target[key])) {
                     target[key] = JSON.parse(JSON.stringify(source[key]))
                  } else {
                     validate(target[key], source[key])
                  }
               } else {
                  if (typeof target[key] === 'undefined' || target[key] === null) {
                     target[key] = source[key]
                  }
               }
            }
         }

         if (Array.isArray(global.db.users)) global.db.users.forEach(u => validate(u, models.users))
         if (Array.isArray(global.db.players)) global.db.players.forEach(p => validate(p, models.players))
         if (Array.isArray(global.db.groups)) global.db.groups.forEach(g => validate(g, models.groups))
         if (Array.isArray(global.db.chats)) global.db.chats.forEach(c => validate(c, models.chats))
         if (global.db.setting) validate(global.db.setting, models.setting)

         let bCount = 0
         if (Array.isArray(global.db.bots)) {
            for (let bot of global.db.bots) {
               bCount++
               let data = bot.data
               if (!data) continue

               if (Array.isArray(data.users)) data.users.forEach(u => validate(u, models.users))
               if (Array.isArray(data.players)) data.players.forEach(p => validate(p, models.players))
               if (Array.isArray(data.groups)) data.groups.forEach(g => validate(g, models.groups))
               if (Array.isArray(data.chats)) data.chats.forEach(c => validate(c, models.chats))

               if (data.setting) {
                  validate(data.setting, models.setting)
               } else {
                  data.setting = JSON.parse(JSON.stringify(models.setting))
               }
            }
         }

         let pr = `✅ *Database successfully synchronized*\n\n`
         pr += `*Main DB :*\n`
         pr += `┌  ◦  Users : ${global.db.users?.length || 0}\n`
         pr += `│  ◦  Groups : ${global.db.groups?.length || 0}\n`
         pr += `└  ◦  Settings : Updated\n\n`
         pr += `*Sub-Bots (${bCount}) :*\n`
         pr += `└  ◦  All nested structures updated`

         m.reply(pr)
      } catch (e) {
         console.error(e)
         return m.reply(Utils.jsonFormat(e))
      }
   },
   operator: true
}