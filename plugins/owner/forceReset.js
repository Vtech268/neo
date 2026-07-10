export const run = {
   usage: ['reset'],
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      hostJid,
      clientJid,
      findJid,
      Config,
      Utils
   }) => {
      try {
         const botData = !hostJid && findJid.bot(clientJid)?.data

         const users = hostJid
            ? global.db.users
            : botData?.users ?? global.db.users

         const chats = hostJid
            ? global.db.chats
            : botData?.chats ?? global.db.chats
         chats.map(v => v.lastreply = 0)

         const [type, amount] = args

         if (type === 'limit') {
            users.filter(v => v.limit < Config.limit && !v.premium).map(v => v.limit = (amount || Config.limit))
            setting.lastReset = new Date * 1
            client.reply(m.chat, Utils.texted('bold', `✅ Successfully reset limit for ${users.length} free users to ${amount || Config.limit}.`), m)
         } else if (type === 'glimit') {
            users.filter(v => v.limit_game < Config.limit_game && !v.premium).map(v => v.limit_game = (amount || Config.limit_game))
            setting.lastReset = new Date * 1
            client.reply(m.chat, Utils.texted('bold', `✅ Successfully reset limit for ${users.length} free users to ${amount || Config.limit_game}.`), m)
         } else if (type === 'point') {
            users.map(v => v.point = (amount || 0))
            client.reply(m.chat, Utils.texted('bold', `✅ Successfully reset point for ${users.length} users to ${amount || 0}.`), m)
         } else if (type === 'balance') {
            users.map(v => v.balance = (amount || 0))
            client.reply(m.chat, Utils.texted('bold', `✅ Successfully reset balance for ${users.length} users to ${amount || 0}.`), m)
         } else if (type === 'pocket') {
            users.map(v => v.pocket = (amount || 0))
            client.reply(m.chat, Utils.texted('bold', `✅ Successfully reset pocket for ${users.length} users to ${amount || 0}.`), m)
         } else if (type === 'guard') {
            users.map(v => v.guard = (amount || 0))
            client.reply(m.chat, Utils.texted('bold', `✅ Successfully reset guard for ${users.length} users to ${amount || 0}.`), m)
         } else if (type === 'all') {
            users.map(v => {
               v.limit = (amount || Config.limit)
               v.limit_game = (amount || Config.limit_game)
               v.point = (amount || 0)
               v.balance = (amount || 0)
               v.pocket = (amount || 0)
               v.guard = (amount || 0)
            })
            client.reply(m.chat, Utils.texted('bold', `✅ Successfully reset all data for ${users.length} users.`), m)
         } else {
            let teks = `• *Usage Example* :\n\n`
            teks += `${isPrefix + command} limit\n`
            teks += `${isPrefix + command} limit 15\n`
            teks += `\n_Type: limit, glimit, point, balance, pocket, guard, all._`
            client.reply(m.chat, teks, m)
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   owner: true
}