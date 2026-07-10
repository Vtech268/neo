import { Instance, Config, Utils } from '@neoxr/wb'
import { toJid } from '../../utils/index.js'
import jwt from 'jsonwebtoken'
import { createHash } from 'crypto'

export const routes = {
   category: 'action',
   path: '/action/login',
   method: 'post',
   parameter: ['type'],
   execution: async (req, res, next) => {
      try {
         const { type, username, password, token, isOperator } = req.body
         const operatorJid = toJid(Config.owner)
         const mainJid = toJid(Config.pairing.number)
         let instanceJid, instanceToken

         if (!type || (type !== 1 && type !== 2))
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Invalid login type'
            })

         // if (type === 2) return res.status(403).json({
         //    creator: global.creator,
         //    status: false,
         //    message: 'Maintenance'
         // })

         if (type === 1 && isOperator) {
            if (!username || !password)
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Username and password can\'t leave empty'
               })

            const creds = global.db.setup
            if (creds?.username !== username || creds?.password != password)
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Invalid username or password'
               })
         }

         if (type === 2) {
            if (!username && !password && !token)
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Credentials can\'t leave empty'
               })

            if (username && password) {
               const creds = global.db?.bots?.find(v =>
                  v.connector?.override?.username === username &&
                  v.connector?.override?.password === createHash('sha256').update(password).digest('hex')
               )

               if (!creds)
                  return res.status(400).json({
                     creator: global.creator,
                     status: false,
                     message: 'Invalid username or password'
                  })

               const fnToken = global.db?.instance?.find(v => v.jid === creds.jid)?.token
               if (!fnToken)
                  return res.status(404).json({
                     creator: global.creator,
                     status: false,
                     message: 'Instance token is not found'
                  })

               instanceToken = fnToken
            } else if (token) {
               const fnToken = global.db?.instance?.find(v => v.token === token)?.token
               if (!fnToken)
                  return res.status(404).json({
                     creator: global.creator,
                     status: false,
                     message: 'Instance token is not found'
                  })

               instanceToken = fnToken
            } else return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Credentials can\'t leave empty'
            })
         }

         const instance = type === 1 ? Instance.getBotDataByJid(mainJid) : Instance.getBotDataByToken(instanceToken)
         if (!instance)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         if (type === 2) {
            if (instance.jid === mainJid)
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'You are the main bot account. Please login using your username and password.'
               })

            instanceJid = global?.db?.bots?.find(v =>
               v.jid === instance.jid
            )
         }

         if (type === 2 && !instanceJid?.connector?.sessionOpts?.owner)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Account not found'
            })

         const accountId = type === 1 ? null : instanceJid.account
         const jid = type === 1 ? operatorJid : toJid(instanceJid.connector.sessionOpts.owner)
         const jwtToken = jwt.sign({ jid, type, username, password, hash: instanceToken || token }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY })
         req.session.login = true
         req.session.type = type
         req.session.jid = jid
         req.session.account = accountId
         req.session.token = jwtToken
         res.json({
            creator: global.creator,
            status: true,
            data: {
               account_id: accountId,
               token: jwtToken,
               jid, type,
               created_at: Date.now(),
               expired_at: Utils.toMs(process.env.JWT_EXPIRY)
            }
         })
      } catch (e) {
         Utils.printError(e)
         res.status(500).json({
            creator: global.creator,
            status: false,
            message: e.message
         })
      }
   },
   error: false
}