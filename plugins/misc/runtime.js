export const run = {
   usage: ['runtime'],
   hidden: ['run'],
   category: 'miscs',
   async: async (m, {
      client,
      hostJid,
      clientJid,
      findJid,
      Utils
   }) => {
      const bot = findJid.bot(clientJid)
      let uptime = hostJid
         ? Utils.toTime(process.uptime() * 1000)
         : bot
            ? Utils.toTime(Date.now() - bot.last_connect)
            : Utils.toTime(process.uptime() * 1000)
      client.reply(m.chat, Utils.texted('bold', `Running for : [ ${uptime} ]`), m)
   },
   error: false
}