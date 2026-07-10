import { Utils, JID } from '@neoxr/wb'
import { toJid } from '../../core/utils/index.js'

export default (client, ctx) => {
   const { hostJid, clientJid, findJid } = JID(client)

   client.getName = jid => {
      try {
         const data = (!hostJid && findJid?.bot(clientJid)) ? findJid.bot(clientJid).data : global.db

         let name = null
         name = data.users.find(v =>
            v.jid === client.decodeJid(jid) || v.lid === client.decodeJid(jid)
         )?.name

         if (!name) {
            name = ctx.store.getName(jid)
         }

         return name
      } catch {
         return null
      }
   }

   client.getJid = (m, input) => {
      try {
         const id = (input && String(input).endsWith('lid') ? input : null)
            || (input && /[.]net/.test(input) ? input : null)
            || (input && !String(input).startsWith('@') && !String(input).endsWith('.net') ? toJid(input) : null)
            || m?.mentionedJid?.[0]
            || m?.quoted?.sender

         if (!id) {
            client.reply(m.chat, Utils.texted('bold', `🚩 Mention or Reply chat target.`), m)
            return null
         }

         let result = null

         if (m?.isGroup) {
            result = client.getJidFromParticipants(m.chat, id)?.id
         }

         if (!result) {
            result = ctx.store.getJidFromJSON(id)?.jid
         }

         if (!result) {
            const data = (!hostJid && findJid?.bot(clientJid)) ? findJid.bot(clientJid).data : global.db
            const decodedId = client.decodeJid(id)
            result = data?.users?.find(v => v.jid === decodedId || v.lid === decodedId)?.jid || null
         }

         if (!result) {
            client.reply(m.chat, `❌ Cannot find JID in the system or database.`, m)
            return null
         }

         return result
      } catch (e) {
         return null
      }
   }
}