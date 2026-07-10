import { Utils } from '@neoxr/wb'
import { toJid } from '../../utils/index.js'
import jwt from 'jsonwebtoken'
import { BOT_TYPE } from '../../../lib/bot-type.js'

export const routes = {
   category: 'action',
   path: '/action/update-bot',
   method: 'post',
   parameter: ['id'],
   execution: async (req, res, next) => {
      try {
         const { id, owner_name, owner_number, method, bot_type } = req.body

         const bot = global.db.bots?.find(v =>
            v._id === id
         )

         if (!bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         if (owner_name && owner_number) {
            if (owner_name.length > 30)
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Owner name is too long'
               })

            if (owner_name === bot.connector?.sessionOpts?.owner_name && toJid(owner_number) === bot.connector?.sessionOpts?.owner)
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Owner detail is the same as the current one'
               })

            const isDiffNumber = toJid(owner_number) !== bot.connector?.sessionOpts?.owner

            if (global.db.bots.find(v => v.connector?.sessionOpts?.owner === toJid(owner_number)) && isDiffNumber)
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Owner number already use by another bot'
               })

            let json = {}
            if (isDiffNumber) {
               const fnOldOwner = bot.data.setting.owners?.find(v => String(bot.connector.sessionOpts.owner?.replace(/@./, '')))
               if (fnOldOwner) Utils.removeItem(bot.data.setting.owners, fnOldOwner)

               bot.connector.sessionOpts.owner_name = owner_name
               bot.connector.sessionOpts.owner = toJid(owner_number)
               bot.data.setting.owners.push(String(owner_number))

               const fnToken = global.db?.instance?.find(v => v.jid === bot.jid)?.token
               if (!fnToken)
                  return res.status(404).json({
                     creator: global.creator,
                     status: false,
                     message: 'Instance token is not found'
                  })

               const jwtToken = jwt.sign({ jid: bot.jid, type: 2, username: bot.connector.override.username, hash: fnToken }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY })
               req.session.login = true
               req.session.type = 2
               req.session.jid = bot.jid
               req.session.token = jwtToken

               json = {
                  creator: global.creator,
                  status: true,
                  message: 'Owner detail updated successfully',
                  data: {
                     token: jwtToken,
                     jid: bot.jid,
                     type: 2,
                     created_at: Date.now(),
                     expired_at: Utils.toMs(process.env.JWT_EXPIRY)
                  }
               }
            } else {
               bot.connector.sessionOpts.owner_name = owner_name

               json = {
                  creator: global.creator,
                  status: true,
                  message: 'Owner detail updated successfully'
               }
            }

            return res.json(json)
         } else if (method) {
            if (bot.is_connected)
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Can\'t update connection method while bot is connected'
               })

            if (!bot.is_logout)
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'Can\'t update connection method while bot is not logged out'
               })

            if (!['pairing', 'qr'].includes(method))
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Invalid connection method'
               })

            bot.method = method

            return res.json({
               creator: global.creator,
               status: true,
               message: 'Connection method updated successfully'
            })
         } else if (bot_type) {
            if (bot.is_connected)
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Can\'t update connection method while bot is connected'
               })

            bot.connector.override.bot_type = bot_type
            bot.connector.override.plugsdir = BOT_TYPE.find(v => v.id === bot_type)?.plugsdir

            return res.json({
               creator: global.creator,
               status: true,
               message: 'Bot type updated successfully'
            })
         } else {
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'No data provided'
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