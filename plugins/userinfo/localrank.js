export const run = {
   usage: ['localrank'],
   category: 'user info',
   async: async (m, {
      client,
      participants,
      hostJid,
      findJid,
      clientJid,
      Config,
      Utils
   }) => {
      try {
         let user = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
         let member = participants.map(u => u.id)
         let users = []
         for (let i = 0; i < member.length; i++) {
            if (user.some(v => v.jid == member[i]) && member[i] != client.decodeJid(client.user.id)) {
               users.push({
                  jid: member[i],
                  point: user.find(v => v.jid == member[i]).point,
                  level: Utils.level(user.find(v => v.jid == member[i]).point, Config.multiplier),
                  limit: user.find(v => v.jid == member[i]).limit
               })
            }
         }
         let point = users.sort((a, b) => b.point - a.point)
         let rank = point.map(v => v.jid)
         let show = Math.min(10, point.length)
         let teks = `乂  *L O C A L - R A N K*\n\n`
         teks += `“You are ranked *${rank.indexOf(m.sender) + 1}* out of *${member.length}* ${await (await client.groupMetadata(m.chat)).subject} group members.”\n\n`
         teks += point.slice(0, show).map((v, i) => '– @' + v.jid.split `@` [0] + '\n    *💴  :  ' + Utils.h2k(v.point) + ' (' + Utils.formatNumber(v.point) + ')*\n    *🎗️  :  ' + v.level[0] + ' [ ' + Utils.formatNumber(v.level[3]) + ' / ' + Utils.formatNumber(v.level[1]) + ' ]*\n    *⚔️  :  ' + Utils.role(Utils.level(v.point)[0]) + '*').join `\n\n`
         teks += `\n\n${global.footer}`
         client.reply(m.chat, teks, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true
}