import { Instance, Config, Utils } from '@neoxr/wb'
import jwt from 'jsonwebtoken'

export default route => async (req, res, next) => {
   try {
      const authorization = req.headers['authorization']
      const token = authorization?.split(' ')?.[1]?.trim()
      const operator = `${Config.owner}@s.whatsapp.net`

      if (!token) {
         return res.status(401).json({
            creator: global.creator,
            status: false,
            msg: 'Authentication credentials are required'
         })
      }

      let payload
      try {
         payload = jwt.verify(token, process.env.JWT_SECRET)
      } catch (err) {
         return res.status(401).json({
            creator: global.creator,
            status: false,
            msg: 'Unauthorized: Invalid or expired token'
         })
      }

      const { jid, type, hash } = payload
      const isAdmin = jid === operator

      if (!type || (type !== 1 && type !== 2)) {
         return res.status(401).json({
            creator: global.creator,
            status: false,
            msg: 'Unauthorized: Invalid session type'
         })
      }

      if (!isAdmin && !Instance.getBotDataByToken(hash)) {
         return res.status(401).json({
            creator: global.creator,
            status: false,
            msg: 'Unauthorized: Invalid or expired session'
         })
      }

      if (route.login === '401-operator' && !isAdmin) {
         return res.status(403).json({
            creator: global.creator,
            status: false,
            msg: 'Forbidden: You must be an admin to access this resource'
         })
      }

      if (route.login === '301-operator' && !isAdmin) {
         return res.redirect('/auth/login')
      }

      next()
   } catch (e) {
      Utils.printError(e)
      res.status(500).json({
         creator: global.creator,
         status: false,
         msg: 'Internal Server Error'
      })
   }
}