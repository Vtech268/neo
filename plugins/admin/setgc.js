export const run = [{
   usage: ['setclose', 'setopen'],
   use: 'time | message',
   category: 'admin tools',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      groupSet,
      Utils
   }) => {
      try {
         if (!text || !text.includes('|')) return m.reply(Utils.example(isPrefix, command, `06:00 | Welcome! Group is now open`))

         const [time, ...msgArr] = text.split('|')
         const cleanTime = time.trim()
         const msg = msgArr.join('|').trim()

         if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(cleanTime)) return m.reply('❌ Invalid time format! Use HH:MM format, e.g., 06:00 or 23:30')

         if (!cleanTime || !msg) return m.reply(Utils.example(isPrefix, command, `06:00 | Welcome! Group is now open`))

         if (command === 'setopen') {
            groupSet.open_at = {
               time: cleanTime,
               msg: msg
            }
            m.reply(`✅ Successfully scheduled the group to open at *${cleanTime}* with message :\n\n"${msg}"\n\n_(This schedule will run daily even if the bot restarts)_`)
         } else if (command === 'setclose') {
            groupSet.close_at = {
               time: cleanTime,
               msg: msg
            }
            m.reply(`✅ Successfully scheduled the group to close at *${cleanTime}* with message :\n\n"${msg}"\n\n_(This schedule will run daily even if the bot restarts)_`)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   isBotAdmin: true,
   admin: true
}, {
   usage: ['resetclose', 'resetopen'],
   category: 'admin tools',
   async: async (m, {
      client,
      command,
      groupSet,
      Utils
   }) => {
      try {
         if (command === 'resetopen') {
            if (!groupSet?.open_at) return m.reply('🚩 The group opening schedule is not set.')
            delete groupSet.open_at
            return m.reply('✅ Successfully removed the group opening schedule.')
         }

         if (command === 'resetclose') {
            if (!groupSet?.close_at) return m.reply('🚩 The group closing schedule is not set.')
            delete groupSet.close_at
            return m.reply('✅ Successfully removed the group closing schedule.')
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   admin: true
}]