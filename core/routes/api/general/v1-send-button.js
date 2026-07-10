import { Instance, Utils } from '@neoxr/wb'

export const routes = {
   category: 'api',
   path: '/v1/button',
   method: 'post',
   parameter: ['number', 'text', 'button'],
   execution: async (req, res, next) => {
      try {
         const { number, text, button, media } = req.body
         const token = req.headers['x-neoxr-token']
         if (!token) return res.status(401).json({
            creator: global.creator,
            status: false,
            message: 'Unauthorized'
         })

         const client = Instance.getSocketByToken(token)
         if (!client) return res.status(404).json({
            creator: global.creator,
            status: false,
            message: 'Bot not found'
         })

         // const isBusiness = await client.getBusinessProfile(Utils.noSuffix(client.user.id))
         // if (isBusiness) return res.status(403).json({
         //    creator: global.creator,
         //    status: false,
         //    message: 'WhatsApp business can\'t send button message'
         // })

         const check = (await client.onWhatsApp(String(number)))[0] || {}
         if (!check.exists) return res.status(404).json({
            creator: global.creator,
            status: false,
            message: 'Number not register on WhatsApp'
         })

         if (media && !Utils.isUrl(media)) return res.status(400).json({
            creator: global.creator,
            status: false,
            message: 'Media must be a valid url'
         })

         let buttons
         try {
            if (typeof button === 'string') {
               buttons = JSON.parse(button)
            } else {
               buttons = button
            }
         } catch (e) {
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Invalid JSON format for buttons'
            })
         }

         if (!Array.isArray(buttons)) return res.status(400).json({
            creator: global.creator,
            status: false,
            message: 'Button parameter must be an array'
         })

         if (buttons.length > 6) return res.status(400).json({
            creator: global.creator,
            status: false,
            message: 'Maximum 6 buttons'
         })

         const msg = await client.sendIAMessage(check.jid, buttons, null, {
            header: '',
            content: String(text),
            footer: global.footer,
            ...(media ? { media } : {})
         })

         res.json({
            creator: global.ceator,
            status: true,
            data: msg
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

