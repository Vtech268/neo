import { Instance, Utils } from '@neoxr/wb'

export const routes = {
   category: 'api',
   path: '/v1/media',
   method: 'post',
   parameter: ['number', 'url'],
   execution: async (req, res, next) => {
      try {
         const { number, url, caption } = req.body
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

         if (!Utils.isUrl(url)) return res.status(400).json({
            creator: global.creator,
            status: false,
            message: 'Media file must be a valid url'
         })

         const msg = await client.sendFile(check.jid, url, '', String(caption || ''), null)
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
