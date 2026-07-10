export const run = {
   usage: ['tfpoint', 'tflimit', 'tflimitgame'],
   use: '@tag amount',
   category: 'user info',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      hostJid,
      clientJid,
      findJid,
      Utils
   }) => {
      try {
         let users = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
         const mapping = {
            tfpoint: 'point',
            tflimit: 'limit',
            tflimitgame: 'limit_game'
         }
         const fee = 25 // 25%
         if (m.quoted) {
            if (m.quoted.isBot) return client.reply(m.chat, Utils.texted('bold', `❌ Cannot make transfers to bot.`), m)
            const [amount] = args
            if (!amount) return client.reply(m.chat, Utils.texted('bold', `🚩 Enter the amount you'd like to transfer.`), m)
            if (isNaN(amount)) return client.reply(m.chat, Utils.texted('bold', `❌ Amount must be a number.`), m)
            const fixAmount = parseInt(amount)
            const ppn = parseInt(((fee / 100) * fixAmount).toFixed(0))
            let data = users.find(v => v.jid === m.sender)?.[mapping[command]] || 0
            const target = client.decodeJid(m.quoted.sender)
            if (target === m.sender) return client.reply(m.chat, Utils.texted('bold', `❌ Unable to transfer to yourself.`), m)
            if (fixAmount > data) return client.reply(m.chat, Utils.texted('bold', `❌ You don’t have enough ${mapping[command].replace(/_/, ' ')} to transfer that amount.`), m)
            if ((fixAmount + ppn) > users.find(v => v.jid === m.sender).point) return client.reply(m.chat, Utils.texted('bold', `❌ Your point is not enough to pay the transfer fee of ${fee}%`), m)
            users.find(v => v.jid === m.sender).point -= (fixAmount + ppn)
            users.find(v => v.jid === m.sender)[mapping[command]] -= fixAmount
            users.find(v => v.jid === target)[mapping[command]] += fixAmount
            let teks = `乂  *T R A N S F E R*\n\n`
            teks += `“Transfer successfully to *@${target.replace(/@.+/g, '')}*”\n\n`
            teks += `➠ *Amount* : ${Utils.formatNumber(fixAmount)}\n`
            teks += `➠ *Fee* : ${Utils.formatNumber(ppn)} [${fee}%]\n`
            teks += `➠ *Type* : ${Utils.ucword(mapping[command].replace(/_/, ' '))}\n`
            teks += `➠ *Remaining Point* : ${Utils.formatNumber(users.find(v => v.jid === m.sender).point)}`
            return client.reply(m.chat, teks, m)
         } else if (m.mentionedJid.length != 0) {
            const [_, amount] = args
            if (!amount) return client.reply(m.chat, Utils.texted('bold', `🚩 Enter the amount you'd like to transfer.`), m)
            if (isNaN(amount)) return client.reply(m.chat, Utils.texted('bold', `❌ Amount must be a number.`), m)
            const fixAmount = parseInt(amount)
            const ppn = parseInt(((fee / 100) * fixAmount).toFixed(0))
            let data = users.find(v => v.jid === m.sender)?.[mapping[command]] || 0
            const target = client.decodeJid(m.mentionedJid[0])
            if (target === client.decodeJid(client.user.id)) return client.reply(m.chat, Utils.texted('bold', `❌ Cannot make transfers to bot.`), m)
            if (target === m.sender) return client.reply(m.chat, Utils.texted('bold', `❌ Unable to transfer to yourself.`), m)
            if (fixAmount > data) return client.reply(m.chat, Utils.texted('bold', `❌ You don’t have enough ${mapping[command].replace(/_/, ' ')} to transfer that amount.`), m)
            if ((fixAmount + ppn) > users.find(v => v.jid === m.sender).point) return client.reply(m.chat, Utils.texted('bold', `❌ Your point is not enough to pay the transfer fee of ${fee}%`), m)
            users.find(v => v.jid === m.sender).point -= (fixAmount + ppn)
            users.find(v => v.jid === m.sender)[mapping[command]] -= fixAmount
            users.find(v => v.jid === target)[mapping[command]] += fixAmount
            let teks = `乂  *T R A N S F E R*\n\n`
            teks += `“Transfer successfully to *@${target.replace(/@.+/g, '')}*”\n\n`
            teks += `➠ *Nominal* : ${Utils.formatNumber(fixAmount)}\n`
            teks += `➠ *Fee* : ${Utils.formatNumber(ppn)} [${fee}%]\n`
            teks += `➠ *Type* : ${Utils.ucword(mapping[command].replace(/_/, ' '))}\n`
            teks += `➠ *Remaining Point* : ${Utils.formatNumber(users.find(v => v.jid === m.sender).point)}`
            client.reply(m.chat, teks, m)
         } else {
            let teks = `• *Example* :\n\n`
            teks += `${isPrefix + command} @0 10000\n`
            teks += `${isPrefix + command} 10000 (reply chat target)`
            client.reply(m.chat, teks, m)
         }
      } catch (e) {
         console.error(e)
         return client.reply(m.chat, Utils.texted('bold', `🚩 Target is not registered in the database.`), m)
      }
   },
   error: false,
   group: true
}