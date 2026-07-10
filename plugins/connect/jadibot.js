import { retry, session } from '../../lib/system/mapping.js'
import qrcode from 'qrcode'
import { BOT_TYPE } from '../../lib/bot-type.js'

let message = new Map()

export const run = [{
   usage: ['host'],
   hidden: ['on', 'jadibot', 'subbot', 'scan', 'host', 'bottype'],
   category: 'bot hosting',
   async: async (m, {
      client,
      args,
      text,
      isPrefix,
      command,
      system,
      Utils,
      Config
   }) => {
      try {
         if (retry.has(m.sender)) throw new Error('❌ Previous request has not been completed.')

         if (['on', 'jadibot', 'subbot', 'scan', 'host'].includes(command)) {
            const [number] = args
            if (!number) return client.reply(m.chat, Utils.example(isPrefix, command, '62858111111'), m)

            if (String(number) === String(client.decodeJid(Config.pairing.number))) throw new Error('❌ You can\'t host main bot number.')

            const result = await client.onWhatsApp(number)
            const { jid, exists } = result?.[0] || {}
            if (!exists) throw new Error('❌ Number is not registered on WhatsApp.')

            const connect = global.db?.bots?.find(v =>
               (v.jid === jid || v.connector?.sessionOpts?.owner === m.sender)
            )

            if (connect) {
               let note = `Number is already hosted : \n\n`
               note += `◦ *Account ID* : ${connect?.account || '-'}\n`
               note += `◦ *Bot* : @${connect.jid.replace(/@.+/, '')}\n`
               note += `◦ *Last Connect* : ${connect.last_connect > 0 ? Utils.timeAgo(connect.last_connect) : '-'}\n`
               note += `◦ *Connected* : ${connect.is_connected ? '✅' : '❌'}\n`
               note += `◦ *Owner* : @${connect.connector?.sessionOpts?.owner?.replace(/@.+/, '')}`
               return m.reply(note.trim())
            }

            if (client.decodeJid(client.user.id) !== `${Config.pairing.number}@s.whatsapp.net`) {
               return m.reply(`🪸 Chat the main bot here : https://wa.me/${Config.pairing.number}?text=${isPrefix + command}`)
            }

            if (global.db?.bots?.length >= Config.bot_hosting.slot) throw new Error('🚩 Sorry, slots are full.')

            const buttons = [{
               name: 'single_select',
               buttonParamsJson: JSON.stringify({
                  title: 'Bot Type',
                  sections: [{
                     rows: BOT_TYPE.map(v => ({
                        title: `${v.name}`,
                        id: `${isPrefix}bottype ${v.id}|${jid}`
                     }))
                  }],
                  icon: 'DEFAULT'
               })
            }]

            await client.sendIAMessage(m.chat, buttons, m, {
               header: '',
               content: 'Let us know what kind of bot you\'re hosting today by choosing a bot type below :',
               footer: ''
            }).then(v => message.set(m.sender, v))
         }

         if (command === 'bottype') {
            const buttonMsg = message.get(m.sender)

            if (buttonMsg) {
               client.sendMessage(m.chat, {
                  delete: {
                     remoteJid: m.chat,
                     fromMe: true,
                     id: buttonMsg.key.id,
                     participant: buttonMsg.sender
                  }
               }).then(() => message.delete(m.sender))
            }

            const [type, jid] = text.split('|')

            const msisdn = jid.trim().replace(/@.+/, '')

            let note = `Send 1 or 2 to choose a method:\n\n`
            note += '*1* - Pairing\n'
            note += '*2* - Scan QR\n\n'
            note += `> Please select an option to continue.`
            return m.reply(note).then(() => {
               session.set(m.sender, [{
                  session: ['sqlite', 'local'].includes(system.session)
                     ? `./${Config.bot_hosting.session_dir}/${msisdn}`
                     : String(msisdn),
                  type: system.session,
                  number: msisdn,
                  owner: m.sender,
                  owner_name: m.pushName,
                  config: process.env.DATABASE_URL || ''
               }, {
                  state: null,
                  number: msisdn,
                  code: Config.pairing.code
               }, m, {
                  bot_type: type?.trim(),
                  plugsdir: BOT_TYPE.find(v => v.id === type?.trim())?.plugsdir
               }])
            })
         }
      } catch (e) {
         m.reply(Utils.texted('bold', e.message))
      }
   },
   error: false,
   limit: true
}, {
   async: async (m, {
      client,
      body,
      child,
      users,
      system,
      Config,
      Utils
   }) => {
      const [create_session, pairing, msg] = session.get(m.sender) || []
      try {
         if (/conversation|extended/.test(m.mtype) && create_session && pairing && msg && ['1', '2'].includes(String(body))) {
            pairing.state = String(body) === String(1) ? true : false

            const result = await client.onWhatsApp(pairing.number)
            const { jid, exists } = result?.[0] || {}
            if (!exists) throw new Error('❌ Number is not registered on WhatsApp.')

            if (users.limit < 1) {
               retry.delete(m.sender)
               session.delete(jid)
               throw new Error('❌ You’ve reached your limit')
            }
            users.limit -= 1

            const socket = await child.create(create_session, pairing)

            if (!socket) {
               retry.delete(m.sender)
               session.delete(m.sender)
               throw new Error('❌ Failed to create bot instance.')
            }

            m.react('🕒')

            socket.register('connect', async ctx => {
               const { sock } = socket
               const timers = setTimeout(() => {
                  const connect = global.db?.bots?.find(v =>
                     (v.jid === jid || v.connector?.sessionOpts?.owner === m.sender) && v.is_connected
                  )

                  if (retry.has(m.sender) && !connect) return m.reply('❌ Request ended, bot is not connected!').then(async () => {
                     clearTimeout(timers)
                     await sock.end()
                     retry.delete(m.sender)
                     session.delete(m.sender)
                     // Utils.removeItem(global.db.bots, global.db.bots.find(v => v.jid === jid))
                  })

                  if (retry.has(m.sender) && connect) return m.reply('✅ Your WhatsApp account has successfully connected.').then(() => {
                     clearTimeout(timers)
                     retry.delete(m.sender)
                  })
               }, 59_000)

               retry.set(m.sender, timers)

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
      } catch (e) {
         return client.reply(m.chat, Utils.texted('bold', e.message), msg)
      }
   },
   error: false
}]