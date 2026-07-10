import { Client, Utils, Config, JID } from '@neoxr/wb'
import baileys from './lib/baileys.js'
import './error.js'
import './lib/system/functions.js'
import './lib/system/config.js'
// import './extractor/proto.js'
import path from 'path'
import cron from 'node-cron'
import fsPromise from 'fs/promises'
import colors from 'colors'
import bytes from 'bytes'
import Mapping, { clone } from './lib/system/mapping.js'
import extra from './lib/system/listeners-extra.js'
import connection from './lib/system/listeners-connection.js'
import TaskScheduler from './lib/system/scheduler.js'
import Market from './lib/system/market.js'
import { models } from './lib/system/models.js'
import system from './lib/system/adapter.js'
import { toJid } from './core/utils/index.js'

import stores from '@neoxr/store'
const store = stores.default || stores

store.config({ max: 50 })

Utils.watchThisFile(path.resolve('./lib/system/scraper.js'))

// Start web server immediately when --server flag is passed
if (process.argv.includes('--server')) {
   Utils.isPortInUse(Config.bot_hosting.host).then(isOn => {
      if (!isOn) import('./core/app.js')
   })
}

const connect = async () => {
   try {
      const client = new Client({
         plugsdir: 'plugins',
         presence: true,
         online: true,
         bypass_disappearing: true,
         pairing: Config.pairing,
         create_session: {
            type: system.session,
            session: 'session',
            config: process.env.DATABASE_URL,
         },
         custom_id: 'neoxr', // Prefix for Custom Message ID (automatically detects isBot for itself)
         bot: Utils.isBot,
         multiple: true,
         soft_retry: 1,
         hard_retry: 1,
         server: process.argv.includes('--server'),
         engines: [baileys, store],
         debug: false // if want to see how this module work :v
      }, {
         browser: Config.pairing.browser,
         shouldIgnoreJid: jid => {
            return /(newsletter|bot)/.test(jid)
         },
         emitOwnEvents: true
      })

      client._bind(connection(system))

      client.on('error', async error => {
         console.error(colors.red(error.message))
         if (error && typeof error === 'object' && error.message) Utils.logFile(error.message)
      })

      client.once('connect', async res => {
         try {
            await system.proxy.init(models, models.structure, Config.database)

            const isEmpty = !global.db.users.length && !global.db.chats.length

            if (isEmpty) {
               const previous = await system.database.fetch()

               if (previous && Object.keys(previous).length > 0) {
                  console.dim('[Proxy DB] Old data found, starting migration...')
                  await system.proxy.migrate(previous, models.structure)
                  console.dim('[Proxy DB] Migration successful!')
               }
            }
         } catch (e) {
            Utils.printError(e)
         }
         if (res && typeof res === 'object' && res.message) Utils.logFile(res.message)
      })

      client.once('ready', async () => {
         if (client?.plugins) Mapping.property.set('plugins', client.plugins)
         if (client?.commands) Mapping.property.set('commands', client.commands)

         if (!Array.isArray(global.db.bots)) global.db.bots = []
         const jid = client.sock.decodeJid(client.sock.user.id)
         const i = global.db.bots?.findIndex(v => v.jid === jid)
         if (i >= 0) global.db.bots.splice(i, 1)

         clone.set('sync', client)

         const options = JID(client.sock)
         const schedule = new TaskScheduler(client.sock, options, system.database)
         schedule.start(15)
         if (!Mapping.schedule.has(Utils.noSuffix(client.sock.user.id))) Mapping.schedule.set(
            Utils.noSuffix(client.sock.user.id),
            schedule
         )

         const market = new Market(client.sock)
         market.setGroups(global.db.groups)
         if (!Mapping.market.has(Utils.noSuffix(client.sock.user.id))) Mapping.market.set(
            Utils.noSuffix(client.sock.user.id),
            market
         )

         const ramCheck = setInterval(() => {
            var ramUsage = process.memoryUsage().rss
            if (ramUsage >= bytes(Config.ram_limit)) {
               clearInterval(ramCheck)
               process.send('reset')
            }
         }, 60 * 1000)

         cron.schedule('0 12 * * *', async () => {
            if (global?.db?.setting?.autobackup) {
               const data = await system.proxy.backup(models.structure, Config.database)
               const now = new Intl.DateTimeFormat('en-CA', { timeZone: process.env.TZ, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()).replace(', ', '_').replace(/:/g, '-')
               const filename = `${Config.database}-${now}.json`
               await fsPromise.writeFile(filename, data, 'utf-8')
               const buffer = await fsPromise.readFile(filename)
               await client.sock.sendFile(toJid(Config.owner), buffer, filename, '', null).then(async () => {
                  await fsPromise.unlink(filename)
               })
            }
         })

         cron.schedule('00 00 * * *', () => {
            if (global?.db?.users && global?.db?.statistic) {
               const data = global.db
               data.setting.lastReset = Date.now()
               data.users.filter(v => v.limit < Config.limit && !v.premium).map(v => v.limit = Config.limit)
               data.users.filter(v => v.limit_game < Config.limit_game && !v.premium).map(v => v.limit_game = Config.limit_game)
               Object.entries(data.statistic).map(([_, prop]) => prop.today = 0)
            }

            if (global?.db?.bots?.length) {
               for (let v of global.db.bots) {
                  const data = v.data
                  data.setting.lastReset = Date.now()
                  data.users.filter(v => v.limit < Config.limit && !v.premium).map(v => v.limit = Config.limit)
                  data.users.filter(v => v.limit_game < Config.limit_game && !v.premium).map(v => v.limit_game = Config.limit_game)
                  if (data.statistic) Object.entries(data.statistic).map(([_, prop]) => prop.today = 0)
               }
            }
         })
      })

      extra(system)(client, store)
   } catch (e) {
      Utils.printError(e)
   }
}

connect().catch(() => connect())