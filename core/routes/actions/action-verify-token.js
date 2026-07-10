import { Utils } from '@neoxr/wb'
import jwt from 'jsonwebtoken'

export const routes = {
   category: 'action',
   path: '/action/verify-token',
   method: 'post',
   parameter: ['token'],
   execution: async (req, res, next) => {
      try {
         const { token } = req.body

         if (global.db?.setup?.token_blacklist) {
            const isUsed = global.db.setup.token_blacklist.some(t => t.token === token)
            if (isUsed) {
               return res.status(401).json({
                  creator: global.creator,
                  status: false,
                  message: 'Unauthorized: This link has already been used'
               })
            }
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

         res.json({
            creator: global.creator,
            status: true,
            message: 'Token is valid'
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