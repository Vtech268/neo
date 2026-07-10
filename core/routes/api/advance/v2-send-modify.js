import { Instance, Utils } from '@neoxr/wb'

export const routes = {
   category: 'api',
   path: '/v2/modify',
   method: 'post',
   parameter: ['jid', 'text', 'thumbnail'],
   execution: async (req, res, next) => {
      try {
         const { jid, text, title, thumbnail, url } = req.body
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

         if (jid.endsWith('@s.whatsapp.net') || jid.endsWith('@c.us')) {
            const check = (await client.onWhatsApp(String(jid)))[0] || {}
            if (!check.exists) return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Number not register on WhatsApp'
            })
         }

         if (!Utils.isUrl(thumbnail)) return res.status(400).json({
            creator: global.creator,
            status: false,
            message: 'Invalid thumbnail URL'
         })

         const isOk = await (await fetch(thumbnail)).status
         if (isOk !== 200) return res.status(400).json({
            creator: global.creator,
            status: false,
            message: 'Thumbnail URL not found or cannot be accessed'
         })

         const msg = await client.sendMessageModify(jid, String(text), null, {
            netral: true,
            title,
            largeThumb: true,
            type: 'preview-link',
            /* choose: landscape (default), potrait, square */
            ratio: 'landscape',
            thumbnail,
            url
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
