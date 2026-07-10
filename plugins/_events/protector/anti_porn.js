import { detectNSFW } from '../../../lib/tensorflow.js'

export const run = {
   async: async (m, {
      client,
      groupSet,
      isAdmin,
      isBotAdmin,
      Utils
   }) => {
      try {
         if (!m.fromMe && (!m.isGroup || (m.isGroup && groupSet.antiporn)) && /sticker/.test(m.mtype)) {
            const buffer = await m?.download()
            if (buffer) {
               const image = await Utils.convertWebp2Jpeg(buffer)
               const json = await detectNSFW(image, 'image/jpeg')
               if (json?.isNSFW) return m.reply(Utils.texted('bold', `💀 Prohibited content.`)).then(() => {
                  if (!m.isGroup) client.updateBlockStatus(m.sender, 'block')
                  if (m.isGroup && !isAdmin && isBotAdmin) return client.sendMessage(m.chat, {
                     delete: {
                        remoteJid: m.chat,
                        fromMe: false,
                        id: m.key.id,
                        participant: m.sender
                     }
                  }).then(() => client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
               })
            }
         }

         if (!m.fromMe && (!m.isGroup || (m.isGroup && groupSet.antiporn)) && /image|video/.test(m.mtype)) {
            const buffer = await m?.download()
            if (buffer) {
               const json = await detectNSFW(buffer, m.mtype)
               if (json?.isNSFW) return m.reply(Utils.texted('bold', `💀 Prohibited content.`)).then(() => {
                  if (!m.isGroup) client.updateBlockStatus(m.sender, 'block')
                  if (m.isGroup && !isAdmin && isBotAdmin) return client.sendMessage(m.chat, {
                     delete: {
                        remoteJid: m.chat,
                        fromMe: false,
                        id: m.key.id,
                        participant: m.sender
                     }
                  }).then(() => client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
               })
            }
         }
      } catch (e) { 
         Utils.printError(e)
      }
   },
   error: false,
   cache: true,
   exception: true
}