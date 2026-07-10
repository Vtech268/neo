export const run = {
   usage: ['+operator', '-operator'],
   hidden: ['+op', '-op'],
   use: 'mention or reply',
   category: 'operator',
   async: async (m, {
      client,
      text,
      command,
      setup,
      Utils
   }) => {
      try {
         const target = client.getJid(m, text)
         if (!target) return
         let p = await client.onWhatsApp(target)
         if (p.length == 0) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid number.`), m)
         let jid = client.decodeJid(p[0].jid)
         let number = jid.replace(/@.+/, '')
         if (['+operator', '+op'].includes(command)) { // add operator number
            let operators = setup.operators
            if (operators.includes(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Target is already the operator.`), m)
            operators.push(number)
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully added @${number} as operator.`), m)
         } else if (['-operator', '-op'].includes(command)) { // remove operator number
            let operators = setup.operators
            if (!operators.includes(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Target is not operator.`), m)
            operators.forEach((data, index) => {
               if (data === number) operators.splice(index, 1)
            })
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully removing @${number} from operator list.`), m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   operator: true
}