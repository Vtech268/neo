import canvacord from 'canvacord'  // have to install canvacord

export const run = {
   async: async (m, {
      client,
      users,
      body,
      setting,
      hostJid,
      clientJid,
      findJid,
      Config,
      Utils,
      Scraper
   }) => {
      try {
         let user = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
         let levelAwal = Utils.level(users.point, Config.multiplier)[0]
         if (users && body) users.point += Utils.randomInt(1, 100)
         let levelAkhir = Utils.level(users.point, Config.multiplier)[0]
         if (levelAwal != levelAkhir && setting.levelup) {
            const avatar = await client.profilePicture(m.sender)
            const cdn = await Scraper.uploadImageV2(avatar)
            if (!cdn.status) return
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
            client.sendFile(m.chat, await rank.build(), 'level.jpg', `乂  *L E V E L - U P*\n\nFrom : [ *${levelAwal}* ] ➠ [ *${levelAkhir}* ]\n*Congratulations!*, you have leveled up 🎉🎉🎉`, m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true
}