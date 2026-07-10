import { Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'action',
   path: '/action/group-manage',
   method: 'post',
   parameter: ['jid', 'action'],
   execution: async (req, res, next) => {
      try {
         const { type, jid } = req.session
         const { jid: id, target, days, action } = req.body

         const data = parsingData(type, jid)

         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         let { groups } = data

         const group = groups?.find(v => v.jid === id)

         if (!group)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Group not found'
            })

         if (action === 'delete_member') {
            if (!target) {
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Parameter "target" is required for delete_member action'
               })
            }

            if (!group?.member?.[target])
               return res.status(404).json({
                  creator: global.creator,
                  status: false,
                  message: 'Member not found'
               })

            delete group.member[target]

            return res.json({
               creator: global.creator,
               status: true,
               message: 'Member removed successfully'
            })
            
         } else if (action === 'upgrade_group') {
            if (!days || isNaN(days) || Number(days) <= 0) {
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  message: 'Parameter "days" must be a valid positive number'
               })
            }

            const additionalTime = Number(days) * 24 * 60 * 60 * 1000

            const now = new Date().getTime()
            if (group.expired && group.expired > now) {
               group.expired += additionalTime
            } else {
               group.expired = now + additionalTime
            }
            
            return res.json({
               creator: global.creator,
               status: true,
               message: `Successfully added ${days} days to group rental period.`
            })

         } else {
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Invalid action provided'
            })
         }
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