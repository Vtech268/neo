export const run = {
   usage: ['redeem'],
   use: 'code',
   category: 'user info',
   async: async (m, {
      args,
      isPrefix,
      command,
      setting,
      users,
      Utils
   }) => {
      try {
         setting.codes = setting.codes || []
         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, 'free86'))

         const [code] = args
         const fnCode = setting.codes.find(c => c.code.toLowerCase() === code.toLowerCase())
         if (!fnCode) return m.reply(`❌ Code *${code}* is not available`)

         fnCode.redeemed = fnCode.redeemed || []
         if (fnCode.redeemed.includes(m.sender)) return m.reply(`❌ You have already redeemed this code.`)

         if (fnCode.max_usage < 1) return m.reply(`❌ This code has no remaining uses.`)

         const toDaysMs = num => {
            const days = Number(num)
            if (isNaN(days)) throw new Error('❌ Invalid number')
            return days * 24 * 60 * 60 * 1000
         }

         fnCode.max_usage--
         fnCode.redeemed.push(m.sender)

         let text = `🎉 Congratulation you've got rewards : \n\n`

         for (let [key, value] of Object.entries(fnCode.rewards)) {
            if (key !== 'premium') {
               users[key] = (users[key] || 0) + value
               text += `✅ ${Utils.ucword(key)} +${value}\n`
            } else {
               users.expired = users.premium
                  ? users.expired + toDaysMs(value)
                  : (Date.now() + toDaysMs(value))

               users.premium = true
               text += `✅ Premium extended for *${value} days*\n`
            }
         }

         m.reply(text.trim())
      } catch (e) {
         m.reply(e.message || Utils.jsonFormat(e))
      }
   },
   error: false
}
