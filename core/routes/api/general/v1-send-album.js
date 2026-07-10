import { Instance, Utils } from '@neoxr/wb'

export const routes = {
   category: 'api',
   path: '/v1/album',
   method: 'post',
   parameter: ['number', 'media'],
   execution: async (req, res, next) => {
      try {
         const { number, media } = req.body
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

         const check = (await client.onWhatsApp(String(number)))[0] || {}
         if (!check.exists) return res.status(404).json({
            creator: global.creator,
            status: false,
            message: 'Number not register on WhatsApp'
         })

         const isHasUrl = media.some(v => !v.url)
         if (isHasUrl) return res.status(400).json({
            creator: global.creator,
            status: false,
            message: 'Invalid media'
         })

         const msg = await client.sendAlbumMessage(check.jid, media, null)

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
