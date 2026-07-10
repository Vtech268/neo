export const run = {
   usage: ['setheader', 'setfooter'],
   use: 'text',
   category: 'owner',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      hostJid,
      Utils
   }) => {
      try {
         if (hostJid) return client.reply(m.chat, Utils.texted('bold', `🚩 This feature is not available on main bot.`), m)
         if (!text) return m.reply(Utils.example(isPrefix, command, command === 'setfooter' ? global.footer : global.header))
         const prop = command.replace('set', '')
         setting[prop] = text
         client.reply(m.chat, Utils.texted('bold', `🚩 ${Utils.ucword(prop)} successfully set.`), m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   owner: true,
   locked: true
}