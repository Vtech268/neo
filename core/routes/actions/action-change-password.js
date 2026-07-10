import { Utils } from '@neoxr/wb'

export const routes = {
   category: 'action',
   path: '/action/change-password',
   method: 'post',
   parameter: ['oldpass', 'password', 'confirm'],
   execution: async (req, res, next) => {
      try {
         const creds = global.db.setup

         if (creds?.password !== oldpass)
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Your old password is incorrect'
            })

         if (creds?.password === password)
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Your current password is already in use'
            })

         if (password !== confirm)
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Your new password and confirm password are not the same'
            })

         req.session.login = false
         res.session.token = null
         req.session = null
         res.json({
            creator: global.creator,
            status: true,
            message: 'Your password has been changed'
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
   error: false,
   login: true
}