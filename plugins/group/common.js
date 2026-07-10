import { format } from 'date-fns'
import { models } from '../../lib/system/models.js'

export const run = {
   usage: ['common'],
   use: 'mention or reply',
   category: 'group',
   async: async (m, {
      client,
      text,
      hostJid,
      clientJid,
      findJid,
      Utils,
      system
   }) => {
      try {
         const id = m?.mentionedJid?.[0] || m?.quoted?.sender
         const number = isNaN(text)
            ? text?.startsWith('+')
               ? text.replace(/[()+\s-]/g, '')
               : text.replace(/@.+/, '')
            : text

         const target = id || number
         if (!target) return client.reply(m.chat, Utils.texted('bold', `🚩 Mention or reply chat target.`), m)

         let jid = null

         if (m.isGroup) {
            let result = client.getJidFromParticipants(m.chat, target)
            jid = result?.id
            if (!jid) {
               result = await client.onWhatsApp(target)
               const { jid: trueJid, exists } = result?.[0] || {}
               if (exists) {
                  jid = trueJid
               }
            }
         } else if (!m.isGroup) {
            jid = client.getRealJid(target)
            if (!jid) {
              const result = await client.onWhatsApp(target)
               const { jid: trueJid, exists } = result?.[0] || {}
               if (exists) {
                  jid = trueJid
               }
            }
         }

         let group = hostJid ? global.db.groups : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.groups : global.db.groups
         if (!group) group = []
         let isJoinedJid = []

         const participatingGroups = Object.values(await client.groupFetchAllParticipating())

         const groupDetails = participatingGroups.filter(v => {
            let participants = client.lidParser(v.participants) || []
            return participants.some(member =>
               member.id === jid || member.id === jid || member.lid === jid
            )
         }).map((_group, i) => {
            const { id, subject, participants } = _group
            let entry = group.find(g => g.jid === id)
            isJoinedJid.push(id)

            if (entry) {
               const expiryStatus = entry.stay ? 'FOREVER' : (entry.expired == 0 ? 'NOT SET' : '' + Utils.timeReverse(entry.expired - new Date() * 1))
               const memberCount = participants.length
               const muteStatus = entry.mute ? 'OFF' : 'ON'
               const lastActivity = format(entry.activity, 'dd/MM/yy HH:mm:ss')

               if (!entry.member) {
                  entry.member = {}
               }

               for (let member of client.lidParser(participants || [])) {
                  if (!entry?.member?.[member.id]) {
                     entry.member[member.id] = {
                        ...models.member
                     }
                  }
               }

               return (
                  `›  *${i + 1}.* ${subject}\n` +
                  `   *💳* : ${id.split('@')[0]}\n` +
                  `   ${expiryStatus} | ${memberCount} | ${muteStatus} | ${lastActivity}`
               )
            } else {
               const newEntry = {
                  jid: id,
                  ...models.groups,
                  name: subject
               }
               group.push(newEntry)

               return (
                  `›  *${i + 1}.* ${subject}\n` +
                  `   *💳* : ${id.split('@')[0]}\n` +
                  `   *✅ NEW - Added to database, details will show on next run.*`
               )
            }
         }).join('\n\n')

         if (!isJoinedJid.length) return client.reply(m.chat, Utils.texted('bold', `🚩 No groups with bots.`), m)

         let caption = `Bot and @${jid?.replace(/@.+/, '')} are in same *${isJoinedJid.length}* groups\n\n`
         caption += groupDetails
         caption += `\n\n${global.footer}`

         const updatedGroups = group.filter(g => isJoinedJid.includes(g.jid))

         if (hostJid) {
            global.db.groups = updatedGroups
         } else {
            const dataRef = findJid.bot(clientJid)
            if (dataRef?.data?.groups) {
               dataRef.data.groups = updatedGroups
            } else {
               global.db.groups = updatedGroups
            }
         }

         m.reply(caption)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, `🚩 Somethung went wrong, check the logs.`, m)
      }
   },
   cache: true
}