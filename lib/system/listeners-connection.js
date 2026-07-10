import { Utils, Instance, Config, JID } from '@neoxr/wb'
import colors from 'colors'
import fsPromise from 'fs/promises'
import fs from 'fs'
import cron from 'node-cron'
import extra from './listeners-extra.js'
import { models } from './models.js'
import Mapping, { clone, session, retry } from './mapping.js'
import TaskScheduler from './scheduler.js'
import Market from './market.js'
import { updateBotStatus } from '../../core/controllers/socket-io.js'
import { toJid } from '../../core/utils/index.js'
import { injectClientProxy } from './injector.js'

export default system => client => {
   const parent = clone.get('sync')

   client.on('error', async error => {
      if ([
         'Device logged out',
         'Multi device mismatch',
         'Method not allowed',
         'Bad session file'
      ].some(msg => error.message.includes(msg)) || /(403|516)/.test(error.message)) {
         try {
            const jid = toJid(client.options.pairing.number)

            updateBotStatus(jid, 'error', error.message || 'An error occurred during the connection.')

            if (client.options.create_session.type === 'local' && fs.existsSync(client.options.create_session.session)) {
               fs.rmSync(client.options.create_session.session, { recursive: true, force: true })
            }
         } catch (e) {
            Utils.printError(e)
         }
      }

      console.error(colors.red(error.message))
   })

   client.on('ready', async ctx => {
      const jid = client.sock.decodeJid(ctx.user.id)
      const number = jid.replace(/@.+/, '')
      if (client.options.debug) console.log(colors.green('[CHILD]', number))

      if (client.options.plugsdir) {
         if (client?.plugins) Mapping.property.set(`plugins-${number}`, client.plugins)
         if (client?.commands) Mapping.property.set(`commands-${number}`, client.commands)
      }
   
      try {
         let record = global.db?.bots?.get(jid)

         await system.proxy.init(models, models.structure, Config.database, jid)

         const isEmpty = !record?.data?.users?.length && !record?.data?.chats?.length

         if (isEmpty) {
            const previous = await system.database.fetchByJid(jid)

            if (previous && Object.keys(previous).length > 0) {
               console.dim('[Proxy DB] Old data found, starting migration...')
               await system.proxy.migrate(previous, models.structure, jid)
               console.dim('[Proxy DB] Migration successful!')
            }
         }

         record = global.db?.bots?.get(jid)

         const options = JID(client.sock)
         const schedule = new TaskScheduler(client.sock, options)
         schedule.start(15)
         if (!Mapping.schedule.has(jid)) Mapping.schedule.set(jid, schedule)

         client.sock = injectClientProxy(client.sock)

         if (!record) {
            if (client.options.debug) console.error(colors.red(`[CHILD] Bot entry not found in global.db.bots for JID: ${jid}`))
            await client.updateBotStatus(jid, {
               stop: false,
               is_connected: true,
               last_connect: Date.now(),
               is_logout: false,
               data: { ...models.structure },
               connector: {
                  sessionOpts: client.options.create_session,
                  pairingConfig: client.options.pairing,
                  override: client.override
               }
            })
            record = global.db?.bots?.find(v => v.jid === jid)
            if (!record) throw new Error('Failed to create/find bot entry after ready.')
         } else {
            await client.updateBotStatus(jid, {
               stop: false,
               is_connected: true,
               last_connect: Date.now(),
               is_logout: false
            })
         }

         record.is_connected = true
         if (!record.data || Object.keys(record.data).length === 0) {
            record.data = {
               ...models.structure,
               ...record.data
            }
         }

         const market = new Market(client.sock)
         market.setGroups(record.data.groups)
         if (!Mapping.market.has(jid)) Mapping.market.set(jid, market)

         const rt = retry.get(client.options.create_session.owner)
         if (rt) {
            clearTimeout(rt)
            retry.delete(client.options.create_session.owner)
         }

         const instance = Instance.getBotDataByJid(jid)

         updateBotStatus(jid, 'success', `Connected!, Token: ${instance.token}`)

         const room = session.get(client.options.create_session.owner)
         if (room) {
            const [_, pairing, m] = room
            if (parent.sock) parent.sock.reply(m.chat, '✅ Your bot is connected.', m).then(async () => {
               await parent.sock.reply(`${Config.owner}@c.us`, `📩 New bot connected : @${pairing.number}`)
               await Utils.delay(1500)
               if (instance?.token && process.env.DOMAIN) {
                  let note = '⚠ This token is used for authorizing the WhatsApp Gateway via the *x-neoxr-token* header.\nTreat this token like a password.\n\n'
                  note += `${instance.token}\n\n`
                  note += `> Login here to manage your bot : ${process.env.DOMAIN}`
                  parent.sock.reply(client.options.create_session.owner, note, m)
               }

               session.delete(client.options.create_session.owner)
            })
         }

         await Utils.delay(3000)

         let database = global.db?.bots?.find(v =>
            v.jid === jid
         )

         if (typeof database.data.setting === 'undefined' || Object.keys(database.data.setting).length < 1) {
            database.data.setting = { ...models.setting }
         }

         const owner = String(client.options.create_session?.owner?.replace(/@.+/, ''))

         if (!database?.data?.setting?.owners?.includes(owner)) {
            if (database?.data?.setting?.owners) database.data.setting.owners.push(owner)
         }

         const plan = Config.bot_hosting.price_list.find(v => v.code === 'trial')

         if (typeof database.plan === 'undefined') {
            database.plan = plan.code
            if (database.limit) database.limit += plan.response
            database.limit = plan.response
            database.expired = Date.now() + (plan.days * 24 * 60 * 60 * 1000)
         }

         if (!database?.account) database.account = Utils.randomInt(999999, 100000)

         cron.schedule('0 12 * * *', async () => {
            try {
               if (database?.data?.setting?.autobackup) {
                  const data = await system.proxy.backup(models.structure, Config.database, jid)
                  const now = new Intl.DateTimeFormat('en-CA', { timeZone: process.env.TZ, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()).replace(', ', '_').replace(/:/g, '-')
                  const filename = `backup-${database.connector.sessionOpts.number}-${now}.json`
                  await fsPromise.writeFile(filename, data, 'utf-8')
                  const buffer = await fsPromise.readFile(filename)
                  await client.sock.sendFile(database.connector.sessionOpts.owner, buffer, filename, '', null).then(async () => {
                     await fsPromise.unlink(filename)
                  })
               }
            } catch (e) {
               Utils.printError(e)
            }
         })
      } catch (e) {
         Utils.printError(e)
         await client.updateBotStatus(jid, {
            is_connected: false,
            is_logout: true,
            last_connect: Date.now()
         })
      }
   })

   extra(system)(client)
}