import { Instance } from '@neoxr/wb'
import jwt from 'jsonwebtoken'

export const routes = {
   category: 'action',
   path: '/action/check-auth',
   parameter: ['token'],
   method: 'post',
   execution: async (req, res, next) => {
      try {
         const { token } = req.body

         if (!token)
            return res.status(401).json({
               creator: global.creator,
               status: false,
               message: 'Token not provided.'
            })

         let decoded
         try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
         } catch (err) {
            return res.status(401).json({
               creator: global.creator,
               status: false,
               message: 'Invalid or expired token.'
            })
         }

         if (!decoded?.jid)
            return res.status(401).json({
               creator: global.creator,
               status: false,
               message: 'Token payload is missing required data.'
            })

         if (decoded.jid !== req.session?.jid)
            return res.status(401).json({
               creator: global.creator,
               status: false,
               message: 'Account associated with this token no longer exists.'
            })

         res.json({
            creator: global.creator,
            status: true,
            message: 'Token is valid.'
         })
      } catch (e) {
         console.error(e)
         res.status(500).json({
            creator: global.creator,
            status: false,
            message: e.message
         })
      }
   },
   error: false
}