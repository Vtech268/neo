export const run = {
   usage: ['listbot'],
   category: 'bot hosting',
   async: async (m, {
      client,
      isOperator,
      Utils
   }) => {
      try {
         const formatNum = num => Utils.texted('bold', Utils.formatNumber(num))
         if (!isOperator) return m.reply(global.status.operator)
         global.db.bots = global.db.bots ? global.db.bots : []
         if (!global.db.bots.length) return client.reply(m.chat, Utils.texted('bold', `🚩 No bots connected.`), m)

         let pr = `乂  *L I S T  B O T*\n\n`

         for (let i = 0; i < global.db.bots.length; i++) {
            const v = global.db.bots[i]
            const user = global.db.users.find(x => x.jid === v.jid)
            const name = user ? user.name : 'No Name'

            if (!v?.account) v.account = Utils.randomInt(999999, 100000)

            let isBusiness = false
            try {
               const biz = await client.getBusinessProfile(v.jid)
               if (biz) isBusiness = true
            } catch {
               isBusiness = false
            }

            pr += `*${i + 1}. ${Utils.maskNumber(client.decodeJid(v.jid).replace(/@.+/, ''))}*\n`
            pr += `◦ *Account ID* : ${v.account}\n`
            pr += `◦ *Name* : ${name}\n`
            pr += `◦ *Method* : ${v.method === 'pairing' ? 'Pairing Code' : 'Scan QR'}\n`
            pr += `◦ *Last Connect* : ${v.last_connect > 0 ? Utils.timeAgo(v.last_connect) : '-'}\n`
            pr += `◦ *Connected* : ${v.is_connected ? '✅' : '❌'}\n`
            pr += `◦ *Logout* : ${v.is_logout ? '✅' : '❌'}\n`
            pr += `◦ *Plan* : ${v?.plan ? Utils.ucword(v.plan) : '-'}\n`
            pr += `◦ *Limit* : ${v?.limit || 0}\n`
            pr += `◦ *WhatsApp* : ${isBusiness ? 'Business (w4b)' : 'Original'}\n`
            pr += `◦ *Expired At* : ${v?.expired > 1 ? Utils.timeReverse(v.expired - new Date() * 1) : '-'}\n`
            pr += `◦ *Data* : ${formatNum(v?.data?.users?.length || 0)} User(s), ${formatNum(v?.data?.chats?.length || 0)} Chat(s) and ${formatNum(v?.data?.groups?.length || 0)} Group(s)\n\n`
         }

         pr += global.footer
         client.reply(m.chat, pr, m)
      } catch (e) {
         client.reply(m.chat, Utils.texted('bold', `🚩 ${e.message}.`), m)
      }
   },
   error: false
}