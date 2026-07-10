import { Chiper, Instance } from '@neoxr/wb'
import fs from 'node:fs'
import qrcode from 'qrcode'
import { retry, session } from '../../lib/system/mapping.js'
import { BOT_TYPE } from '../../lib/bot-type.js'
import { toJid } from '../../core/utils/index.js'

const chiper = new Chiper

export const run = {
   usage: ['botinfo', 'botstart', 'botstop', 'botlogout', 'changebottype', 'changebotowner', 'changebotnumber'],
   hidden: ['logout'],
   category: 'bot hosting',
   async: async (m, {
      client,
      args,
      text,
      isPrefix,
      command,
      Config,
      Utils,
      system,
      child
   }) => {
      try {
         if (!global.db?.bots || !Array.isArray(global.db.bots)) return client.reply(m.chat, Utils.texted('bold', `🚩 Bot database not available.`))
         if (!global.db.bots.length) return client.reply(m.chat, Utils.texted('bold', `🚩 No bots hosted.`), m)

         const owner = client.decodeJid(m.sender)
         const bot = global.db.bots.find(v =>
            v.connector.sessionOpts.owner === owner || v.data.setting.owners.includes(String(m.sender.replace(/@.+/, '')))
         )
         if (!bot) return client.reply(m.chat, Utils.texted('bold', `❌ You don't have any hosted bot.`), m)

         if (command === 'botinfo') {
            let pr = `乂  *B O T I N F O*\n\n`
            pr += `   ◦ *Account ID* : ${bot?.account || '-'}\n`
            pr += `   ◦ *JID* : @${bot.jid.replace(/@.+/, '')}\n`
            pr += `   ◦ *Name* : ${client.getName(bot.jid) ?? 'No Name'}\n`
            pr += `   ◦ *Last Connect* : ${bot.last_connect > 0 ? Utils.timeAgo(bot.last_connect) : '-'}\n`
            pr += `   ◦ *Plan* : ${bot?.plan ? Utils.ucword(bot.plan) : '-'}\n`
            pr += `   ◦ *Limit* : ${bot?.limit || 0}\n`
            pr += `   ◦ *Expired At* : ${bot?.expired > 1 ? Utils.timeReverse(bot.expired - new Date() * 1) : '-'}\n\n`
            pr += global.footer
            client.reply(m.chat, pr, m)
         }

         if (command === 'botstart') {
            if (retry.has(bot.connector.sessionOpts.owner)) return client.reply(m.chat, Utils.texted('bold', `❌ You are in the process of connecting, please wait a moment before trying again.`), m)
            if (bot.is_connected) return client.reply(m.chat, Utils.texted('bold', `❌ Your bot is already connected.`), m)

            if (bot?.plan != 'none') {
               const now = Date.now()
               if (bot.expired && now > bot.expired) return client.reply(m.chat, Utils.texted('bold', `❌ Your bot subscription has expired. (Contact the owner to upgrade your plan)`), m)
               if (bot.limit < 1) return client.reply(m.chat, Utils.texted('bold', `❌ Your bot has reached its response limit. (Contact the owner to upgrade your plan)`), m)
            }

            const msisdn = bot.jid.replace(/\D/g, '')

            session.set(bot.connector.sessionOpts.owner, [{
               session: ['sqlite', 'local'].includes(system.session)
                  ? `./${Config.bot_hosting.session_dir}/${msisdn}`
                  : String(msisdn),
               type: system.session,
               number: msisdn,
               owner: bot.connector.sessionOpts.owner,
               owner_name: bot.connector.sessionOpts?.owner_name || 'Owner',
               config: process.env.DATABASE_URL || ''
            }, {
               state: bot.method === 'pairing',
               number: msisdn,
               code: Config.pairing.code
            }, m, {
               ...bot.connector.override
            }])

            const [create_session, pairing, msg, override] = session.get(bot.connector.sessionOpts.owner) || []

            const socket = await child.create(create_session, pairing, override)

            if (!socket) {
               retry.delete(bot.connector.sessionOpts.owner)
               session.delete(bot.connector.sessionOpts.owner)
               return client.reply(m.chat, Utils.texted('bold', `❌ Failed to create bot instance.`), m)
            }

            m.react('🕒')

            socket.register('connect', async ctx => {
               const { sock } = socket
               const timers = setTimeout(() => {
                  const connect = bot.is_connected

                  if (retry.has(bot.connector.sessionOpts.owner) && !connect) return m.reply('❌ Request ended, bot is not connected!').then(async () => {
                     clearTimeout(timers)
                     await sock.end()
                     retry.delete(bot.connector.sessionOpts.owner)
                     session.delete(bot.connector.sessionOpts.owner)
                  })

                  if (retry.has(bot.connector.sessionOpts.owner) && connect) return m.reply('✅ Your WhatsApp account has successfully connected.').then(() => {
                     clearTimeout(timers)
                     retry.delete(bot.connector.sessionOpts.owner)
                  })
               }, 59_000)

               retry.set(bot.connector.sessionOpts.owner, timers)

               if (ctx?.qr) {
                  let text = `乂  *L O G I N*\n\n`
                  text += `1. On the WhatsApp home screen, tap *( ⋮ )* and select *Linked Devices*\n`
                  text += `2. Scan the QR code below\n`
                  text += `3. This QR code will expire in 60 seconds\n\n`
                  text += global.footer
                  const buffer = await qrcode.toBuffer(ctx.qr, { type: 'png' })
                  return client.sendFile(m.chat, buffer, 'qr.png', text.trim(), msg)
               }

               if (ctx?.code) {
                  let text = `乂  *L O G I N*\n\n`
                  text += `1. On the WhatsApp home screen, tap *( ⋮ )* and select *Linked Devices*\n`
                  text += `2. Tap "Link with phone number instead"\n`
                  text += `3. Enter this code: *${ctx.code}*\n`
                  text += `4. This code will expire in 60 seconds\n\n`
                  text += global.footer
                  return client.reply(m.chat, text.trim(), msg)
               }
            })
         }

         if (command === 'botstop') {
            if (bot.stop) return client.reply(m.chat, Utils.texted('bold', `❌ Your bot is already stopped.`), m)

            const instance = Instance.getSocketByJid(bot.jid)
            if (!instance) return client.reply(m.chat, Utils.texted('bold', `❌ Your connection was force-closed by WhatsApp.`), m)

            bot.stop = true
            bot.is_connected = false
            bot.last_connect = 0

            await client.reply(m.chat, Utils.texted('bold', `✅ Bot stopped successfully.`), m)
            await instance.end()
         }

         if (/logout/.test(command)) {
            if (bot.is_logout) return client.reply(m.chat, Utils.texted('bold', `❌ Your bot is already disconnected.`), m)

            const instance = Instance.getSocketByJid(bot.jid)
            if (!instance) return client.reply(m.chat, Utils.texted('bold', `❌ Your connection was force-closed by WhatsApp.`), m)

            client.reply(m.chat, Utils.texted('bold', `✅ Bot disconnected (Logout).`), m).then(async () => {
               await instance.logout()
               const sessionPath = `./${Config.bot_hosting.session_dir}/${bot.jid.replace(/@.+/, '')}`
               if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, {
                  recursive: true,
                  force: true
               })
            })
         }

         if (command === 'changebottype') {
            if (bot.is_connected) return client.reply(m.chat, Utils.texted('bold', `❌ You can't change the bot type while the bot is connected.`), m)

            const [bot_type] = args

            if (bot_type) {
               bot.connector.override.bot_type = bot_type
               bot.connector.override.plugsdir = BOT_TYPE.find(v => v.id === bot_type)?.plugsdir

               client.reply(m.chat, Utils.texted('bold', `✅ Bot type changed successfully.`), m)
            } else {

               const buttons = [{
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                     title: 'Bot Type',
                     sections: [{
                        rows: BOT_TYPE.map(v => ({
                           title: `${v.name}`,
                           id: `${isPrefix}changebottype ${v.id}`
                        }))
                     }],
                     icon: 'DEFAULT'
                  })
               }]

               client.sendIAMessage(m.chat, buttons, m, {
                  header: '',
                  content: `Your current bot type is : *${BOT_TYPE.find(v => v.id === bot.connector.override.bot_type)?.name}*`,
                  footer: ''
               })
            }
         }

         if (command === 'changebotowner') {
            const [name, number] = text.split('|')

            const owner_name = name?.trim()
            const owner_number = number?.trim()

            if (!owner_name && !owner_number) return client.reply(m.chat, Utils.example(isPrefix, command, 'Jokowi | 6285123456789'), m)

            if (owner_name && owner_number) {
               if (owner_name.length > 30) return client.reply(m.chat, Utils.texted('bold', `❌ Owner detail is the same as the current one.`), m)
               if (owner_name === bot.connector?.sessionOpts?.owner_name && toJid(owner_number) === bot.connector?.sessionOpts?.owner) return client.reply(m.chat, Utils.texted('bold', `❌ Owner name is too long.`), m)

               const isDiffNumber = toJid(owner_number) !== bot.connector?.sessionOpts?.owner

               if (global.db.bots.find(v => v.connector?.sessionOpts?.owner === toJid(owner_number)) && isDiffNumber) return client.reply(m.chat, Utils.texted('bold', `❌ Owner number already use by another bot.`), m)

               if (isDiffNumber) {
                  const fnOldOwner = bot.data.setting.owners?.find(v => String(bot.connector.sessionOpts.owner?.replace(/@./, '')))
                  if (fnOldOwner) Utils.removeItem(bot.data.setting.owners, fnOldOwner)

                  bot.connector.sessionOpts.owner_name = owner_name
                  bot.connector.sessionOpts.owner = toJid(owner_number)
                  bot.data.setting.owners.push(String(owner_number))

                  const fnToken = global.db?.instance?.find(v => v.jid === bot.jid)?.token
                  if (!fnToken) return client.reply(m.chat, Utils.texted('bold', `❌ Instance token is not found.`), m)
               }
            } else {
               bot.connector.sessionOpts.owner_name = owner_name
            }

            client.reply(m.chat, Utils.texted('bold', `✅ Owner detail updated successfully.`), m)
         }

         if (command === 'changebotnumber') {
            if (bot.is_connected) return client.reply(m.chat, Utils.texted('bold', `❌ You can't change the bot type while the bot is connected.`), m)

            const [number] = args

            if (!number) return client.reply(m.chat, Utils.example(isPrefix, command, '6285123456789'), m)

            if (
               String(number) === String(Config.owner) ||
               String(number) === String(Config.pairing.number)
            ) return client.reply(m.chat, Utils.texted('bold', `❌ This number cannot be used for this action.`), m)

            if (global.db.bots?.some(v =>
               v.jid === toJid(number)
            )) return client.reply(m.chat, Utils.texted('bold', `❌ The number is already registered as a bot.`), m)

            const result = await client.onWhatsApp(String(number))
            const { jid, exists } = result?.[0] || {}

            if (!exists) return client.reply(m.chat, Utils.texted('bold', `❌ The number is not registered on WhatsApp.`), m)

            if (bot.jid === jid) return client.reply(m.chat, Utils.texted('bold', `❌ The new number is the same as the current number.`), m)

            try {
               const socket = Instance.getSocketByJid(bot.jid)
               if (socket) {
                  await socket.logout()
               }
            } catch { }

            const token = global.db.instance.find(v => v.jid === bot.jid)
            if (!token) return client.reply(m.chat, Utils.texted('bold', `❌ The previous number is not registered as an active bot instance.`), m)

            if (['sqlite', 'local'].includes(system.session)) {
               const oldNumber = bot.jid.replace(/@.+/, '')
               await Utils.renameDatabaseSqlite(`./databases/${oldNumber}.db`, `./databases/${number}.db`)
            }

            bot._id = chiper.encrypt(jid)
            bot.jid = jid
            bot.connector.sessionOpts.session = ['sqlite', 'local'].includes(system.session)
               ? `./${Config.bot_hosting.session_dir}/${number}`
               : String(number)
            bot.connector.sessionOpts.number = String(number)
            bot.connector.pairingConfig.number = String(number)

            client.reply(m.chat, Utils.texted('bold', `✅ The number has been changed successfully.`), m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.texted('bold', `🚩 ${e.message}.`), m)
      }
   },
   error: false
}