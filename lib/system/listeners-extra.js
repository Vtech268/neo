import { Utils, JID, Config } from '@neoxr/wb'
import path from 'path'
import fs from 'node:fs'
import baileys from './baileys.js'
import { NodeCache } from '@cacheable/node-cache'
const cache = new NodeCache({
   stdTTL: Config.cooldown
})
import colors from 'colors'
import { captcha, greater } from '../canvas.js'
import { schedule, market } from './mapping.js'
import { models } from '../../lib/system/models.js'
const defaults = Object.freeze({
   profile: fs.readFileSync('./media/image/default.jpg'),
   background: fs.readFileSync('./media/image/bg.jpg')
})
let handler = null
const handlerPath = path.resolve('./handler.js')
Utils.watchThisFile(handlerPath, (mod) => {
   handler = mod.default
})

export default system => (client, store) => {
   try {
      if (client.options.debug) console.log(colors.yellow(`[EXTRA LISTENERS] Registering extra listeners for bot: ${client.getBotIdentifier()?.replace(/@.+/, '')}`))

      client.on('message.delete', ctx => {
         const { sock } = client
         const { hostJid, clientJid, findJid } = JID(sock)

         if (!global.db) return
         if (!ctx?.message || ctx.message?.key?.fromMe || ctx.message?.isBot || !ctx.message?.sender) return

         const sender = ctx.message.sender
         if (cache.get(sender) === 1) return cache.set(sender, 1)

         const groups = hostJid
            ? global.db.groups
            : findJid.bot(clientJid)?.data?.groups ?? global.db.groups

         if (!groups || Object.keys(ctx.message).length < 1) return
         if (!ctx.message.isGroup) return

         const group = groups.find(v => v.jid === ctx.message.chat)
         if (!group?.antidelete) return

         sock.copyNForward(ctx.message.chat, ctx.message)
      })

      client.on('stories', async ctx => {
         const { sock } = client
         const { hostJid, clientJid, findJid } = JID(sock)
         if (!global.db) return

         const senderId = ctx.sender
         const userId = sock.decodeJid(sock.user.id)

         const data = hostJid
            ? global.db
            : findJid.bot(clientJid)?.data ?? global.db

         if (!ctx.message?.key) return
         if (senderId === userId) return
         if (!data?.setting?.online) return

         await sock.sendMessage(ctx.message.chat, {
            react: {
               text: Utils.random(['🤣', '🥹', '😂', '😋', '😎', '🤓', '🤪', '🥳', '😠', '😱', '🤔']),
               key: ctx.message.key
            }
         }, {
            statusJidList: [senderId]
         })
      })

      client.on('presence.update', update => {
         if (!update) return

         const { sock } = client
         const { hostJid, clientJid, findJid } = JID(sock)
         if (!global.db) return

         const { id, presences } = update
         if (!id.endsWith('g.us')) return

         const data = hostJid
            ? global.db
            : findJid.bot(clientJid)?.data ?? global.db

         const groupSet = data?.groups?.find(v => v.jid === id)
         if (!groupSet) return

         for (const sender in presences) {
            const user = data?.users?.find(v => v.jid === sender || v.lid === sender)
            if (!user) continue

            const presence = presences[user.jid] || presences[user.lid]
            if (!presence) continue
            if (user?.lid === sock.decodeJid(sock.user.lid)) continue

            const lastPresence = presence.lastKnownPresence
            const member = groupSet?.member?.[user.jid]

            if (!member || member.afk <= -1 || !member.afk) continue

            if (lastPresence === 'composing' || lastPresence === 'recording') {
               const timeOffline = new Date() - (member.afk || 0)
               sock.reply(id, `System detects activity from @${user.jid.replace(/@.+/, '')} after being offline for : ${Utils.texted('bold', Utils.toTime(timeOffline))}\n\n➠ ${Utils.texted('bold', 'Reason')} : ${member.afkReason || '-'}`, member.afkObj)

               member.afk = -1
               member.afkReason = ''
               member.afkObj = {}
            }
         }
      })

      client.on('message', async ctx => {
         const { sock, main } = client
         if (!sock?.decodeJid) {
            Utils.printError('Socket not found. Ensure the connection to the server is established and the Baileys version used is compatible.')
            return
         }
         if (store && !store?.client) store.bind(ctx.store)
         baileys(sock, ctx)
         if (handler) handler(sock, { ...ctx, schedule: schedule.get(sock.decodeJid(sock.user.id)), market: market.get(sock.decodeJid(sock.user.id)), system }, main?.valid ? client : null)
      }, Infinity, false)

      client.on('group.add', async ctx => {
         try {
            const { sock } = client
            const { hostJid, clientJid, findJid } = JID(sock)
            if (!global.db || !ctx.member) return

            const memberId = ctx.member?.phoneNumber || ctx.member
            if (!memberId || typeof memberId !== 'string') return

            const users = hostJid
               ? global.db.users
               : findJid.bot(clientJid)?.data?.users ?? global.db.users
            const groups = hostJid
               ? global.db.groups
               : findJid.bot(clientJid)?.data?.groups ?? global.db.groups
            const setting = hostJid
               ? global.db.setting
               : findJid.bot(clientJid)?.data?.setting ?? global.db.setting

            const groupSet = groups.find(v => v.jid === ctx.jid)
            if (!groupSet) return

            const isAdmin = ctx.groupMetadata?.participants?.some(
               v => v.id === sock.decodeJid(sock.user.id) && v.admin
            )

            if (groupSet.member?.[memberId]?.left && isAdmin) {
               sock.groupParticipantsUpdate(ctx.jid, [memberId], 'remove')
               delete groupSet.member[memberId]
               return
            }

            if (!groupSet.member?.[memberId]) {
               groupSet.member[memberId] = { ...models.member }
            }

            let pic
            try {
               pic = await sock.profilePictureUrl(memberId, 'image') ?? defaults.profile
            } catch {
               pic = defaults.profile
            }

            if (groupSet?.localonly) {
               const user = users.find(v => v.jid === memberId)
               const isIndonesian = memberId.startsWith('62')
               if ((!user?.whitelist && !isIndonesian) || !isIndonesian) {
                  if (memberId.endsWith('@lid')) return
                  sock.reply(ctx.jid, Utils.texted('bold', `Sorry @${memberId.split`@`[0]}, this group is only for Indonesian people. You will be removed.`))
                  sock.updateBlockStatus(memberId, 'block')
                  await Utils.delay(2000)
                  return sock.groupParticipantsUpdate(ctx.jid, [memberId], 'remove')
               }
            }

            if (groupSet?.captcha) {
               sock.captcha = sock.captcha || {}
               const memberTag = `@${memberId.replace(/@.+/, '')}`
               const code = captcha()

               const caption = `Hi ${memberTag} 👋🏻\nWelcome to the group *${ctx.subject}*. Before participating, please complete *VERIFICATION* by sending the *CAPTCHA CODE* shown in the image.\n\n*Timeout*: [1 minute]`

               sock.captcha[memberId] = {
                  chat: await sock.sendMessageModify(ctx.jid, caption, null, {
                     largeThumb: true,
                     type: 'preview-link',
                     thumbnail: code.image
                  }, { disappear: 8400 }),
                  to: memberId,
                  groupId: ctx.jid,
                  code: code.text,
                  wrong: 0,
                  timeout: setTimeout(() => {
                     if (!sock.captcha[memberId]) return
                     sock.reply(ctx.jid, Utils.texted('bold', `⚠ Sorry ${memberTag}, you ignored the verification process. You have been removed.`), null, { disappear: 8400 })
                        .then(() => {
                           sock.groupParticipantsUpdate(ctx.jid, [memberId], 'remove')
                           delete sock.captcha[memberId]
                        })
                  }, 60_000)
               }
            }

            const welcome = await greater(defaults.background, pic, `Welcome to ${ctx.subject}`, `Let's enjoy with us!`)
            if (!welcome) return

            const txtTemplate = groupSet?.text_welcome || `Thanks +tag for joining into +grup group.`
            const txt = txtTemplate
               .replace('+tag', `@${memberId.split`@`[0]}`)
               .replace('+grup', ctx.subject)

            if (groupSet?.welcome && !groupSet?.captcha) {
               sock.sendMessageModify(ctx.jid, txt, null, {
                  largeThumb: true,
                  type: 'preview-link',
                  /* choose: landscape (default), potrait, square */
                  ratio: 'landscape',
                  thumbnail: welcome,
                  url: setting.link
               }, { disappear: 8400 })
            }
         } catch (e) {
            Utils.printError(e)
         }
      })

      client.on('group.remove', async ctx => {
         try {
            const { sock } = client
            const { hostJid, clientJid, findJid } = JID(sock)
            if (!global.db || !ctx.member) return

            const memberId = ctx.member?.phoneNumber || ctx.member
            if (!memberId || typeof memberId !== 'string') return

            const groups = hostJid
               ? global.db.groups
               : findJid.bot(clientJid)?.data?.groups ?? global.db.groups
            const setting = hostJid
               ? global.db.setting
               : findJid.bot(clientJid)?.data?.setting ?? global.db.setting

            const groupSet = groups.find(v => v.jid === ctx.jid)
            if (!groupSet) return

            if (groupSet.member?.[memberId]) {
               groupSet.member[memberId].left = true
            }

            let pic
            try {
               pic = await sock.profilePictureUrl(memberId, 'image') ?? defaults.profile
            } catch {
               pic = defaults.profile
            }

            sock.captcha = sock.captcha || {}
            if (sock.captcha?.[memberId]) {
               clearTimeout(sock.captcha[memberId]?.timeout)
               delete sock.captcha[memberId]
            }

            const leave = await greater(defaults.background, pic, 'Leaving Group', 'Good bye and see you ...')
            if (!leave) return

            const txtTemplate = groupSet?.text_left || `Good bye +tag :)`
            const txt = txtTemplate.replace('+tag', `@${memberId.split`@`[0]}`)
               .replace('+grup', ctx.subject)

            if (groupSet?.left) {
               sock.sendMessageModify(ctx.jid, txt, null, {
                  largeThumb: true,
                  type: 'preview-link',
                  /* choose: landscape (default), potrait, square */
                  ratio: 'landscape',
                  thumbnail: leave,
                  url: setting.link
               }, { disappear: 8400 })
            }
         } catch (e) {
            Utils.printError(e)
         }
      })

      client.on('group.promote', ctx => {
         if (!ctx?.jid || !ctx?.member?.phoneNumber) return
         const { sock } = client
         sock.reply(ctx.jid, `▲ @${ctx.author.split`@`[0]} promoted @${ctx.member.phoneNumber.split`@`[0]} to admin.`)
      })

      client.on('group.demote', ctx => {
         if (!ctx?.jid || !ctx?.member?.phoneNumber || !ctx?.author) return
         const { sock } = client
         sock.reply(ctx.jid, `▼ @${ctx.author.split`@`[0]} demoted @${ctx.member.phoneNumber.split`@`[0]} from admin.`)
      })

      client.on('group.request', ctx => {
         if (!ctx?.data?.id || !ctx?.data?.participantPn) return
         const { sock } = client
         if (ctx?.data?.action === 'revoked') {
            sock.reply(ctx.data.id, `− @${ctx.data.participantPn.split`@`[0]} has cancelled their request to join.`)
         } else if (ctx?.data?.action === 'created') {
            sock.reply(ctx.data.id, `+ @${ctx.data.participantPn.split`@`[0]} is requesting to join this group.`)
         }
      })

      client.on('caller', async ctx => {
         try {
            if (typeof ctx === 'boolean') return
            await client.sock.rejectCall(ctx.id, ctx.jid)
         } catch { }
      })
   } catch (e) {
      Utils.printError(e)
   }
}