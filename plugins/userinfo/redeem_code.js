import { format } from 'date-fns'

export const run = {
   usage: ['redeemcode'],
   hidden: ['codelist'],
   category: 'user info',
   async: async (m, {
      isPrefix,
      setting,
      Utils
   }) => {
      try {
         setting.codes = setting.codes || []

         if (!setting.codes?.length) throw new Error('🚩 Data empty.')
         let text = `Use *${isPrefix}redeem <code>* to redeem.\n\n`

         for (let code of setting.codes.sort((a, b) => a.created_at - b.created_at)) {
            text += `〄 *Code* : ${code.code}\n`
            text += `〄 *Max Usage* : ${code.redeemed.length} / ${code.max_usage}\n`
            text += `〄 *Rewards* :\n`
            for (let [k, v] of Object.entries(code.rewards)) {
               text += `\t◦ ${Utils.ucword(k)} : *${v}*\n`
            }
            text += `〄 *Created At* : ${format(new Date(code.created_at), 'dd/MM/yy HH:mm:ss')}\n\n`
         }

         m.reply(text.trim())
      } catch (e) {
         m.reply(e.message || Utils.jsonFormat(e))
      }
   },
   error: false
}