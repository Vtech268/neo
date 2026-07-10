import { Utils } from '@neoxr/wb'
import requestIp from 'request-ip'
import jwt from 'jsonwebtoken'
import { createHash } from 'crypto'

setInterval(() => {
   if (global.db?.setup?.token_blacklist) {
      const now = Math.floor(Date.now() / 1000)
      global.db.setup.token_blacklist = global.db.setup.token_blacklist.filter(t => t.exp > now)
   }
}, 5 * 60 * 1000)

export const routes = {
   category: 'action',
   path: '/action/reset-password',
   method: 'post',
   parameter: ['password', 'confirm', 'token'],
   execution: async (req, res, next) => {
      try {
         const { password, confirm, token } = req.body

         global.db.setup.token_blacklist = global.db.setup.token_blacklist || []

         const isUsed = global.db.setup.token_blacklist.some(t => t.token === token)
         if (isUsed) {
            return res.status(401).json({
               creator: global.creator,
               status: false,
               message: 'Unauthorized: This link has already been used.'
            })
         }

         let payload
         try {
            payload = jwt.verify(token, process.env.JWT_SECRET)
         } catch (err) {
            return res.status(401).json({
               creator: global.creator,
               status: false,
               message: 'Unauthorized: Invalid or expired token'
            })
         }

         const ip = requestIp.getClientIp(req)
         if (payload.ip !== ip)
            return res.status(401).json({
               creator: global.creator,
               status: false,
               message: 'Unauthorized: IP address mismatch. Please request a new link.'
            })

         const bot = global.db?.bots?.find(v =>
            v.connector?.override?.email === payload.email
         )

         if (!bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Account not found'
            })

         if (password !== confirm)
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Passwords do not match'
            })

         const newPass = createHash('sha256').update(password).digest('hex')

         if (bot.connector?.override?.password === newPass)
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'New password must be different from the old one'
            })

         bot.connector.override.password = newPass

         global.db.setup.token_blacklist.push({
            token: token,
            exp: payload.exp
         })

         res.json({
            creator: global.creator,
            status: true,
            message: 'Password successfully changed. You can now login.'
         })
      } catch (e) {
         Utils.printError(e)
         if (!res.headersSent) {
            res.status(500).json({
               creator: global.creator,
               status: false,
               message: e.message
            })
         }
      }
   },
   error: false
}