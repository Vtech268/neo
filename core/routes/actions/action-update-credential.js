import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'
import { createHash } from 'crypto'

export const routes = {
   category: 'action',
   path: '/action/update-credential',
   method: 'post',
   parameter: ['data'],
   execution: async (req, res, next) => {
      try {
         const { type, jid } = req.session

         if (type === 1)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'You are not allowed to access this route.'
            })

         const { data: newCredential } = req.body

         if (!newCredential || typeof newCredential !== 'object')
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Invalid settings data provided'
            })

         const data = parsingData(type, jid)

         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         let { bot } = data

         if (!bot.connector) bot.connector = {}
         if (!bot.connector.override) bot.connector.override = {}

         if (newCredential.username) {
            const usernameAlreadyUse = global.db?.bots?.some(v =>
               v.jid !== jid &&
               v.connector?.override?.username === newCredential.username
            )

            if (usernameAlreadyUse) {
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'Username is already in use. Choose another username.'
               })
            }
         }

         if (newCredential.email) {
            const emailAlreadyUse = global.db?.bots?.some(v =>
               v.jid !== jid &&
               v.connector?.override?.email === newCredential.email
            )

            if (emailAlreadyUse) {
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'Email is already in use. Choose another email.'
               })
            }
         }

         const allowedKeys = ['username', 'email', 'password']

         for (const key in newCredential) {
            if (allowedKeys.includes(key)) {
               if (key === 'password') {
                  if (newCredential[key]) {
                     bot.connector.override[key] = createHash('sha256').update(newCredential[key]).digest('hex')
                  }
               } else {
                  bot.connector.override[key] = newCredential[key]
               }
            }
         }

         res.json({
            creator: global.creator,
            status: true,
            message: 'Credential updated successfully'
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