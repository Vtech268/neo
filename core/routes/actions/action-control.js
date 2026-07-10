import { Config, Utils, Instance } from '@neoxr/wb'
import qrcode from 'qrcode'
import { retry, io } from '../../../lib/system/mapping.js'
import system from '../../../lib/system/adapter.js'

export const routes = {
   category: 'action',
   path: '/action/control',
   method: 'post',
   parameter: ['id', 'action'],
   execution: async (req, res, next) => {
      try {
         const { id, action } = req.body
         const now = Date.now()

         const bot = global.db.bots?.find(v =>
            v._id === id
         )

         if (!bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         if (action === 'start') {
            if (!bot.is_connected && !bot.stop && !bot.is_logout) {
               bot.is_logout = true
            }

            if (req.io) {
               io.set(bot.jid, req.io)
            } else {
               console.error(`[CRITICAL] req.io is undefined for JID: ${bot.jid}. WebSocket updates will fail.`)
               return res.status(500).json({
                  creator: global.creator,
                  status: false,
                  message: 'Internal Error: WebSocket handler not available.'
               })
            }

            if (retry.has(bot.connector.sessionOpts.owner))
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'You are in the process of connecting, please wait a moment before trying again.'
               })

            if (bot.is_connected)
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'The bot is already connected.'
               })

            if (bot?.plan != 'none') {
               if (bot.expired && now > bot.expired) {
                  return res.status(403).json({
                     creator: global.creator,
                     status: false,
                     message: 'Your bot subscription has expired. (Contact the owner to upgrade your plan)'
                  })
               }

               if (bot.limit < 1)
                  return res.status(403).json({
                     creator: global.creator,
                     status: false,
                     message: 'Your bot has reached its response limit. (Contact the owner to upgrade your plan)'
                  })
            }

            io.set(bot.jid, req.io)

            res.status(200).json({
               creator: global.creator,
               status: true,
               message: 'The connection process has started. Please scan the QR or enter the code.'
            })

            const msisdn = bot.jid.replace(/\D/g, '')
            const socket = await req.bot.create({
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
            }, {
               ...bot.connector.override
            })

            if (!socket?.register) return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Failed to initialize socket instance'
            })

            socket.register('connect', async ctx => {
               const { sock } = socket
               const timeoutDuration = 59_000
               const timers = setTimeout(() => {
                  if (retry.has(bot.jid)) {
                     req.io.emit('status', {
                        jid: bot.jid,
                        status: 'timeout',
                        message: 'The request has ended, the bot did not connect within the time limit.'
                     })
                     sock.end()
                     retry.delete(bot.connector.sessionOpts.owner)
                     // Utils.removeItem(global.db.bots, global.db.bots.find(v => v.jid === jid))
                  }
               }, timeoutDuration)

               retry.set(bot.connector.sessionOpts.owner, timers)

               if (ctx?.qr) {
                  const buffer = await qrcode.toBuffer(ctx.qr, { type: 'png' })
                  req.io.emit(`connect.${msisdn}`, {
                     jid: bot.jid,
                     qr: buffer.toString('base64'),
                     code: null
                  })
               }

               if (ctx?.code) {
                  req.io.emit(`connect.${msisdn}`, {
                     jid: bot.jid,
                     qr: null,
                     code: ctx.code
                  })
               }
            })
         } else if (action === 'stop') {
            if (bot.stop)
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'Bot is already stopped'
               })

            const instance = Instance.getSocketByJid(bot.jid)
            if (instance) {
               await instance.end()
            }
            bot.stop = true
            bot.is_connected = false
            bot.last_connect = 0
            return res.json({
               creator: global.creator,
               status: true,
               message: 'Bot stopped successfully'
            })
         } else if (action === 'logout') {
            if (bot.is_logout)
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'Bot is already logout'
               })

            const instance = Instance.getSocketByJid(bot.jid)
            if (instance) {
               await instance.logout()
            }
            bot.is_logout = true
            bot.stop = true
            bot.is_connected = false
            bot.last_connect = 0
            return res.json({
               creator: global.creator,
               status: true,
               message: 'Bot logout successfully'
            })
         }
      } catch (e) {
         Utils.printError(e)
         res.status(500).json({
            creator: global.creator,
            status: false,
            message: e.message
         })
      }
   },
   error: false,
   login: true
}