import { USD } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['me'],
   category: 'user info',
   async: async (m, {
      client,
      blockList,
      users,
      setting,
      hostJid,
      clientJid,
      findJid,
      Config,
      Utils
   }) => {
      let chats = hostJid ? global.db.chats : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.chats : global.db.chats
      let groups = hostJid ? global.db.groups : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.groups : global.db.groups
      let _own = [...new Set([Config.owner, ...setting.owners])]
      const avatar = await client.profilePicture(m.sender)
      let blocked = blockList.includes(m.sender) ? true : false
      let now = new Date() * 1
      let lastseen = (users.lastseen == 0) ? 'Never' : Utils.toDate(now - users.lastseen)
      let usebot = (users.usebot == 0) ? 'Never' : Utils.toDate(now - users.usebot)
      let caption = `乂  *U S E R - P R O F I L E*\n\n`
      caption += `	◦  *Name* : ${m.pushName}\n`
      caption += `	◦  *Pocket* : ${USD.format(users.pocket)}\n`
      caption += `	◦  *Balance* : ${USD.format(users.balance)}\n`
      caption += `	◦  *Point* : ${Utils.formatNumber(users.point)}\n`
      caption += `	◦  *Guard* : ${Utils.formatNumber(users.guard)}\n`
      caption += `	◦  *Limit* : ${Utils.formatNumber(users.limit)}\n`
      caption += `	◦  *Limit Game* : ${Utils.formatNumber(users.limit_game)}\n`
      caption += `	◦  *Level* : ${Utils.level(users.point, Config.multiplier)[0]} (${Utils.role(Utils.level(users.point, Config.multiplier)[0])})\n`
      caption += `	◦  *Hitstat* : ${Utils.formatNumber(users.hit)}\n`
      caption += `	◦  *Warning* : ${((m.isGroup) ? (typeof groups.find(v => v.jid == m.chat).member[m.sender] != 'undefined' ? groups.find(v => v.jid == m.chat).member[m.sender].warning : 0) + ' / 5' : users.warning + ' / 5')}\n\n`
      caption += `乂  *R E F E R R A L*\n\n`
      caption += `	◦  *Total* : ${USD.format(users?.referrals?.reduce((sum, v) => sum + v.reward, 0) || 0) || 0}\n`
      caption += `	◦  *Referral* : ${users?.referrals?.length || 0}\n`
      caption += `	◦  *Code* : ${users?.refcode || '-'}\n\n`
      caption += `乂  *U S E R - S T A T U S*\n\n`
      caption += `	◦  *Blocked* : ${(blocked ? '√' : '×')}\n`
      caption += `	◦  *Banned* : ${(new Date - users.ban_temporary < Config.timeout) ? Utils.toTime(new Date(users.ban_temporary + Config.timeout) - new Date()) + ' (' + ((Config.timeout / 1000) / 60) + ' min)' : users.banned ? '√' : '×'}\n`
      caption += `	◦  *Use In Private* : ${(chats.map(v => v.jid).includes(m.sender) ? '√' : '×')}\n`
      caption += `	◦  *Premium* : ${(users.premium ? '√' : '×')}\n`
      caption += `	◦  *Expired* : ${users.expired == 0 ? '-' : Utils.timeReverse(users.expired - new Date() * 1)}\n`
      caption += `	◦  *Partner* : ${(users.taken ? '@' + users?.partner?.replace(/@.+/, '') : '-')}\n`
      caption += `	◦  *Verified* : ${(users.verified ? '√' : '×')}\n\n`
      caption += global.footer
      client.sendMessageModify(m.chat, caption, m, {
         largeThumb: true,
         type: 'preview-link',
         ratio: 'square',
         thumbnail: avatar,
         url: setting.link,
         icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
      })
   },
   error: false
}