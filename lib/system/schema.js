import { models } from './models.js'
import init from './init.js'
import { Utils, Config } from '@neoxr/wb'

export default (m, options = {}) => {
   let { hostJid, clientJid, findJid } = options
   let data = !hostJid && findJid.bot(clientJid) ? findJid.bot(clientJid).data : global.db

   const user = data.users.find(v => v.jid === m.sender)
   if (user) {
      init.execute(user, models.users, {
         lid: m.isGroup ? m?.key?.participant : m.chat,
         name: m.pushName,
         limit: Config.limit,
         limit_game: Config.limit_game,
         referrals: [],
         refcode: Utils.makeId(7)
      })
   } else {
      data.users.push({
         jid: m.sender,
         lid: m.isGroup ? m?.key?.participant : m.chat,
         name: m.pushName,
         limit: Config.limit,
         limit_game: Config.limit_game,
         referrals: [],
         refcode: Utils.makeId(7),
         ...(init.getModel(models?.users || {}))
      })
   }

   if (m.isGroup) {
      const group = data.groups.find(v => v.jid === m.chat)
      if (group) {
         init.execute(group, models.groups)
      } else {
         data.groups.push({
            jid: m.chat,
            ...(init.getModel(models?.groups || {}))
         })
      }
   }

   const chat = data.chats.find(v => v.jid === m.chat)
   if (chat) {
      init.execute(chat, models.chats)
   } else {
      data.chats.push({
         jid: m.chat,
         ...(init.getModel(models?.chats || {}))
      })
   }

   if (!data.setting || Object.keys(data.setting).length === 0) {
      data.setting = init.getModel(models?.setting || {})
   } else {
      init.execute(data.setting, models.setting)
   }

   if (!global.db.setup || Object.keys(global.db.setup).length === 0) {
      global.db.setup = init.getModel(models?.setup || {})
   } else {
      init.execute(global.db.setup, models.setup)
   }
}