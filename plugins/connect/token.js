export const run = {
   usage: ['token'],
   category: 'bot hosting',
   async: async (m, {
      client,
      args,
      isPrefix,
      isOperator,
      Utils
   }) => {
      try {
         const bot = global.db.bots
        
         const [opts] = args
         if (opts === 'main') {
            if (!isOperator) return m.reply(global.status.operator)
            const ins = global.db?.instance?.find(v => v.jid === client.decodeJid(client.user.id))
            if (!ins) return client.reply(m.chat, Utils.texted('bold', '🚩 Instance for your bot was not found.'), m)
            let pr = '⚠ This token is used for authorizing the WhatsApp Gateway via the *x-neoxr-token* header.\nTreat this token like a password.\n\n'
            pr += `${ins.token}\n\n`
            pr += `> To read the documentation, send ${isPrefix}docs`
            return client.reply(m.chat, pr, m)
         }

         const fn = bot.find(v => v.jid === m.sender) || bot.find(v => v.connector.sessionOpts.owner === m.sender)
         if (!fn) return client.reply(m.chat, Utils.texted('bold', '🚩 You are not listed as a bot host.'), m)

         const instance = global.db?.instance?.find(v => v.jid === fn.jid)
         if (!instance) return client.reply(m.chat, Utils.texted('bold', '🚩 Instance for your bot was not found.'), m)

         let pr = '⚠ This token is used for authorizing the WhatsApp Gateway via the *x-neoxr-token* header.\nTreat this token like a password.\n\n'
         pr += `${instance.token}\n\n`
         pr += `> To read the documentation, send ${isPrefix}docs`
         client.reply(m.chat, pr, m)
      } catch (e) {
         client.reply(m.chat, Utils.texted('bold', `🚩 ${e.message}.`), m)
      }
   },
   error: false,
   private: true
}