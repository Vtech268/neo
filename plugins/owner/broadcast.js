import { Converter } from '@neoxr/wb'
const mediaCache = new Set()

export const run = {
   usage: ['bcr', 'bc', 'bcgc', 'bcv', 'bcgcv', 'bcprem', 'bcptv', 'bcswgc'],
   use: 'text or reply media',
   category: 'owner',
   async: async (m, {
      client,
      text,
      command,
      setting,
      hostJid,
      clientJid,
      findJid,
      Utils
   }) => {
      try {
         const data = hostJid
            ? global.db
            : findJid.bot(clientJid)
               ? findJid.bot(clientJid).data
               : global.db

         const { users, chats } = data
         const chatJid = chats.filter(v => v.jid.endsWith('.net')).map(v => v.jid)
         const premiumJid = users.filter(v => v.premium).map(v => v.jid) || []
         const groupJid = Object.values(await client.groupFetchAllParticipating())
         const receiverJid = setting.receiver.length ? setting.receiver.map(v => v + '@c.us') : []

         const id = ['bc', 'bcv'].includes(command)
            ? chatJid
            : command === 'bcr'
               ? receiverJid
               : command === 'bcprem'
                  ? premiumJid
                  : groupJid

         if (!id?.length) return client.reply(m.chat, Utils.texted('bold', `🚩 Error: ID does not exist.`), m)

         const q = m.quoted ? m.quoted : m
         const mime = (q.msg || q).mimetype || ''
         const group = ['bcgc', 'bcgcv', 'bcptv', 'bcswgc'].includes(command)

         if (/image\/(webp)/.test(mime)) {
            if (command === 'bcswgc') return client.reply(m.chat, '🚩 Stickers are not supported for this command.', m)
            client.sendReact(m.chat, '🕒', m.key)
            const keyId = q.key?.id
            let media

            if (!mediaCache.has(keyId)) {
               media = await q.download()
               if (!media) return client.reply(m.chat, '🚩 Failed to download media.', m)
               mediaCache.add(keyId)
            }

            for (let jid of id) {
               const member = group ? client.lidParser(jid?.participants)?.map(v => v.id) : []
               await client.sendSticker(group ? jid.id : jid, media, null, {
                  packname: setting.sk_pack,
                  author: setting.sk_author,
                  mentions: command == 'bcgc' ? member : []
               })
               await Utils.delay(1500)
            }
            return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : command === 'bcprem' ? 'premium users' : 'groups'}`), m).then(() => {
               if (mediaCache.has(keyId)) mediaCache.delete(keyId)
            })
         }

         if (/video|image\/(jpe?g|png)/.test(mime)) {
            client.sendReact(m.chat, '🕒', m.key)
            const keyId = q.key?.id
            let media

            if (command === 'bcptv') {
               if (!mediaCache.has(keyId)) {
                  media = await q.download()
                  if (!media) return client.reply(m.chat, '🚩 Failed to download media.', m)
                  mediaCache.add(keyId)
               }

               if (/video/.test(mime)) {
                  for (let jid of id) {
                     const member = group ? client.lidParser(jid?.participants)?.map(v => v.id) : []
                     const room = group ? jid.id : jid
                     await client.sendPtv(room, media, null, { mentions: member })
                     await Utils.delay(1500)
                  }

                  return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${id.length} groups.`), m).then(() => {
                     if (mediaCache.has(keyId)) mediaCache.delete(keyId)
                  })
               } else return client.reply(m.chat, Utils.texted('bold', `🚩 Use this command with video.`), m)
            } else if (command === 'bcswgc') {
               for (let jid of id) {
                  const room = group ? jid.id : jid
                  await client.groupStatus(room, {
                     message: { [q.mtype]: { ...q, caption: text || q.text || '' } },
                     caption: text || q.text || ''
                  })
                  await Utils.delay(1500)
               }

               return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send status broadcast to ${id.length} groups`), m)
            } else {
               if (!mediaCache.has(keyId)) {
                  media = await q.download()
                  if (!media) return client.reply(m.chat, '🚩 Failed to download media.', m)
                  mediaCache.add(keyId)
               }

               for (let jid of id) {
                  const room = group ? jid.id : jid
                  let caption = ''
                  if (q?.text || text) {
                     caption += `乂  *B R O A D C A S T*\n\n`
                     caption += q.text || text
                     caption += `\n\n${global.footer}`
                  }

                  const member = group ? client.lidParser(jid?.participants)?.map(v => v.id) : []
                  const properties = (command === 'bcgc')
                     ? { contextInfo: { mentionedJid: member } }
                     : command == 'bcgcv'
                        ? { viewOnce: true, contextInfo: { mentionedJid: member } }
                        : command == 'bcv'
                           ? { viewOnce: true }
                           : {}

                  await client.sendFile(room, media, '', caption, null, {}, properties)
                  await Utils.delay(1500)
               }
            }

            return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : command === 'bcprem' ? 'premium users' : 'groups'}`), m).then(() => {
               if (mediaCache.has(keyId)) mediaCache.delete(keyId)
            })
         }

         if (/audio/.test(mime)) {
            client.sendReact(m.chat, '🕒', m.key)
            const keyId = q.key?.id
            let media

            if (command === 'bcswgc') {
               for (let jid of id) {
                  const room = group ? jid.id : jid
                  await client.groupStatus(room, {
                     message: { [q.mtype]: { ...q, caption: text || q.text || '' } },
                     caption: text || q.text || ''
                  })
                  await Utils.delay(1500)
               }

               return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send status broadcast to ${id.length} groups`), m)
            } else {
               if (!mediaCache.has(keyId)) {
                  media = q.ptt ? await Converter.toPTT(await q.download()) : await q.download()
                  if (!media) return client.reply(m.chat, '🚩 Failed to download media.', m)
                  mediaCache.add(keyId)
               }

               for (let jid of id) {
                  const room = group ? jid.id : jid
                  const member = group ? client.lidParser(jid?.participants)?.map(v => v.id) : []
                  const properties = (command === 'bcgc')
                     ? { contextInfo: { mentionedJid: member } }
                     : command == 'bcgcv'
                        ? { viewOnce: true, contextInfo: { mentionedJid: member } }
                        : {}

                  await client.sendFile(room, media, '', '', null, {
                     ptt: q.ptt
                  }, properties)
                  await Utils.delay(1500)
               }
               return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : command === 'bcprem' ? 'premium users' : 'groups'}`), m).then(() => {
                  if (mediaCache.has(keyId)) mediaCache.delete(keyId)
               })
            }
         }

         if (text) {
            client.sendReact(m.chat, '🕒', m.key)
            if (command === 'bcswgc') {
               const color = `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase()}`
               for (let jid of id) {
                  const room = group ? jid.id : jid
                  await client.groupStatus(room, {
                     text: text,
                     background: color
                  })
                  await Utils.delay(1500)
               }

               return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send status broadcast to ${id.length} groups`), m)
            } else {
               for (let jid of id) {
                  const room = group ? jid.id : jid
                  const member = group ? client.lidParser(jid?.participants)?.map(v => v.id) : []
                  client.sendIAMessage(room, [{
                     name: 'inapp_signup',
                     buttonParamsJson: JSON.stringify({})
                  }], null, {
                     header: 'Broadcast Message 📢',
                     content: text
                  }, { mentionedJid: command === 'bcgc' ? member : [] })
                  await Utils.delay(1500)
               }
               return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : command === 'bcprem' ? 'premium users' : 'groups'}`), m)
            }
         }

         client.reply(m.chat, Utils.texted('bold', `🚩 Use this command with text or by replying to an image, video or audio.`), m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   owner: true
}