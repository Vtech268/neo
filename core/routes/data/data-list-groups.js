import { Utils } from '@neoxr/wb'
import { parse, stringify } from 'flatted'
import { parsingData } from '../../utils/index.js'

export const routes = {
   category: 'data',
   path: '/data/groups',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         const { type, jid } = req.session

         const data = parsingData(type, jid)

         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         let { groups } = data

         const safeGroupData = parse(stringify(groups))

         const ultraSafeGroupData = safeGroupData.map(group => {
            let cleanMembers = {}

            if (group.member && typeof group.member === 'object') {
               for (const jid in group.member) {
                  if (group.member.hasOwnProperty(jid)) {
                     const memberData = group.member[jid]

                     cleanMembers[jid] = {
                        ...memberData,
                        afkObj: {}
                     }
                  }
               }
            }

            const { member, ...cleanGroup } = group

            cleanGroup.member = cleanMembers

            if (cleanGroup.message) {
               delete cleanGroup.message
            }
            if (cleanGroup.contextInfo) {
               delete cleanGroup.contextInfo
            }

            return cleanGroup
         })

         const responseObject = {
            creator: global.creator,
            status: true,
            data: {
               stats: {
                  rental: (ultraSafeGroupData?.filter(v => v.expired > 1) || [])?.length,
                  total: ultraSafeGroupData.length
               },
               groups: ultraSafeGroupData
            }
         }

         const finalResponse = parse(stringify(responseObject))

         res.json(finalResponse)

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