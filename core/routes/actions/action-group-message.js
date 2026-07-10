import { Instance, Config, Utils } from '@neoxr/wb'
import multer from 'multer'
import { toJid } from '../../utils/index.js'

const getMentions = async (client, jid) => {
   try {
      const metadata = await client.groupMetadata(jid)
      if (!metadata || !metadata.participants) return []
      return metadata.participants.map(p => p.id)
   } catch (e) {
      console.error('Failed to get group metadata for hidetag:', e)
      return []
   }
}

const storage = multer.memoryStorage()
const uploader = multer({
   storage: storage,
   limits: {
      fileSize: 5 * 1024 * 1024
   },
   fileFilter: (req, file, cb) => {
      cb(null, true)
   }
}).single('file')

export const routes = {
   category: 'action',
   path: '/action/group-message',
   method: 'post',
   middleware: [],
   execution: async (req, res, next) => {
      uploader(req, res, async (err) => {
         try {
            const { jid: groupId, type, message, caption = '', hidetag, status } = req.body
            const file = req.file

            const { type: sessionType, jid: sessionJid } = req.session
            const main = toJid(Config.pairing.number)

            let client

            if (sessionType === 1) {
               client = Instance.getSocketByJid(main)
            } else if (sessionType === 2) {
               const bot = global?.db?.bots?.find(v =>
                  v.jid === sessionJid || v.connector.sessionOpts.owner === sessionJid
               )
               if (!bot) {
                  return res.status(404).json({
                     creator: global.creator,
                     status: false,
                     message: 'Bot not found for your session'
                  })
               }

               if (!Instance.getSocketByJid(bot.jid))
                  return res.status(404).json({
                     creator: global.creator,
                     status: false,
                     message: 'Instance data for your bot not found'
                  })

               client = Instance.getSocketByJid(bot.jid)
            }

            if (!client)
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Could not determine a client instance'
               })

            const enableHidetag = hidetag === 'true'
            const isStatus = status === 'true'
            const mentions = enableHidetag ? await getMentions(client, groupId) : []
            const watermark = `This message was sent via ${req.protocol}://${req.get('Host')}`

            switch (type) {
               case 'text':
                  isStatus ? await client.groupStatus(groupId, {
                     text: (message + '\n\n> ' + watermark)?.trim()
                  }) : await client.reply(groupId, (message + '\n\n> ' + watermark)?.trim(), null, {
                     mentions: mentions
                  })
                  break

               case 'media':
                  isStatus ? await client.groupStatus(groupId, {
                     media: file.buffer,
                     caption: (caption + '\n\n> ' + watermark)?.trim()
                  }) : await client.sendFile(groupId, file.buffer, file.originalname, (caption + '\n\n> ' + watermark)?.trim(), null, {
                     document: false,
                  }, { mentions })
                  break

               case 'file':
                  isStatus ? await client.groupStatus(groupId, {
                     media: file.buffer,
                     caption: (caption + '\n\n> ' + watermark)?.trim()
                  }) : await client.sendFile(groupId, file.buffer, file.originalname, (caption + '\n\n> ' + watermark)?.trim(), null, {
                     document: true,
                  }, { mentions })
                  break

               case 'voice':
                  isStatus ? await client.groupStatus(groupId, {
                     media: file.buffer
                  }) : await client.sendFile(groupId, file.buffer, file.originalname, '', null, {
                     ptt: true,
                  }, { mentions })
                  break

               default:
                  return res.status(400).json({
                     creator: global.creator,
                     status: false,
                     message: 'Invalid message type provided'
                  })
            }

            res.json({
               creator: global.creator,
               status: true,
               message: 'Message sent successfully!'
            })
         } catch (e) {
            Utils.printError(e)
            res.status(500).json({
               creator: global.creator,
               status: false,
               message: e.message
            })
         }
      })
   },
   error: false,
   login: true
}