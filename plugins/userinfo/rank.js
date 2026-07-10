export const run = {
   usage: ['rank'],
   category: 'user info',
   async: async (m, {
      client,
      hostJid,
      clientJid,
      findJid,
      Config,
      Utils
   }) => {
      try {
         let users = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
         const point = users.sort((a, b) => b.point - a.point)
         const rank = point.map(v => v.jid)
         const show = Math.min(10, point.length)
         let teks = `乂  *G L O B A L - R A N K*\n\n`
         teks += `“You are ranked *${rank.indexOf(m.sender) + 1}* out of *${users.length}* users.”\n\n`
         teks += point.slice(0, show).map((v, i) => '– @' + v.jid.split `@` [0] + '\n    *💴  :  ' + Utils.formatNumber(v.point) + '*\n    *🎗  :  ' + Utils.level(v.point, Config.multiplier)[0] + ' [ ' + Utils.formatNumber(Utils.level(v.point, Config.multiplier)[3]) + ' / ' + Utils.formatNumber(Utils.level(v.point, Config.multiplier)[1]) + ' ]*\n    *⚔️  :  ' + Utils.role(Utils.level(v.point, Config.multiplier)[0]) + '*').join `\n\n`
         teks += `\n\n${global.footer}`
         client.reply(m.chat, teks, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}