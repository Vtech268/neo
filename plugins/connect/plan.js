import { Config } from '@neoxr/wb'

export const run = {
   usage: ['plan'],
   use: ['no code'],
   category: 'bot hosting',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         if (!global.db.bots?.length) return client.reply(m.chat, Utils.texted('bold', `🚩 No bots connected.`), m)
         if (!args.length) return m.reply(Utils.example(isPrefix, command, '1 pro'))
         const bot = global.db.bots?.map(v => v._id)
         const [number, plan] = args
         if (isNaN(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid number.`), m)
         const token = bot?.[parseInt(number) - 1]
         if (!token) return client.reply(m.chat, Utils.texted('bold', `🚩 Token not found.`), m)
         const fn = global.db.bots.find(b => b._id === token)
         if (!fn) return client.reply(m.chat, Utils.texted('bold', `🚩 Bot not found.`), m)
         if (plan === 'none') {
            fn.plan = 'none'
            fn.limit = 0
            fn.expired = 0
            client.reply(m.chat, Utils.texted('bold', `✅ Bot @${fn.jid.replace(/@.+/, '')} plan removed.`), m)
         } else {
            const choosenPlan = Config.bot_hosting.price_list.find(v => v.code === plan)
            if (!choosenPlan) throw new Error(`Plan ${plan} not found.`)
            fn.plan = choosenPlan.code
            if (fn.limit) fn.limit += choosenPlan.response
            fn.limit = choosenPlan.response
            fn.expired = Date.now() + (choosenPlan.days * 24 * 60 * 60 * 1000)
            client.reply(m.chat, Utils.texted('bold', `✅ Bot @${fn.jid.replace(/@.+/, '')} upgraded to ${choosenPlan.name} plan.`), m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.texted('bold', `🚩 ${e.message}.`), m)
      }
   },
   error: false,
   operator: true
}