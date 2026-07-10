import { backup } from '../../../lib/system/mapping.js'

export const routes = {
   category: 'data',
   path: '/data/backup/:id',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         const { id } = req.params

         if (!backup.has(id)) {
            return res.status(404).send(`
                <html>
                   <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                      <h3>Link Expired or Invalid</h3>
                      <p>The backup link is only valid for 5 minutes. Please generate a new backup.</p>
                   </body>
                </html>
             `)
         }

         const fileData = backup.get(id)

         res.setHeader('Content-Type', 'application/json')
         res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`)

         res.send(fileData.data)

         backup.delete(id) 
      } catch (e) {
         res.status(500).send('Internal Server Error')
      }
   },
   error: false
}