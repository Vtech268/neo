import canvacord from 'canvacord'

export const run = {
   usage: ['level'],
   category: 'user info',
   async: async (m, {
      client,
      users,
      hostJid,
      clientJid,
      findJid,
      Config,
      Utils,
      Scraper
   }) => {
      try {
         let user = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
         client.sendReact(m.chat, '🕒', m.key)
         const avatar =  await client.profilePicture(m.sender)
         const cdn = await Scraper.uploadImageV2(avatar)
         const point = user.sort((a, b) => b.point - a.point).map(v => v.jid)
         const rank = new canvacord.Rank()
            .setRank(point.indexOf(m.sender) + 1)
            .setLevel(Utils.level(users.point, Config.multiplier)[0])
            .setAvatar(cdn.data.url)
            .setCurrentXP(users.point)
            .setRequiredXP(Utils.level(users.point, Config.multiplier)[1])
            .setStatus('online')
            .setProgressBar('#FFFFFF', 'COLOR')
            .setUsername(String(m.pushName || 'N/A'))
            .setDiscriminator(Utils.randomInt(1000, 9999))
         client.sendFile(m.chat, await rank.build(), 'level.jpg', '', m)
      } catch (e) {
         console.log(e)
         m.reply(Utils.jsonFormat(e))
      }
   },
   error: false
}