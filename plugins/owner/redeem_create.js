import { format } from 'date-fns'

export const run = {
   usage: ['+redeem'],
   hidden: ['+code'],
   use: 'reward | usage | code',
   category: 'owner',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         setting.codes = setting.codes || []
         const validRewards = ['limit', 'point', 'premium', 'balance', 'pocket', 'guard']

         if (!text) return explain(m, { client, isPrefix, command })
         if (!text.includes('|')) return explain(m, { client, isPrefix, command })

         let [rewardText, usageText, codeText] = text.split('|').map(v => v.trim())

         if (!rewardText || !usageText || !codeText) return explain(m, { client, isPrefix, command })

         const rewardArgs = rewardText.split(' ').filter(v => v)

         if (rewardArgs.length % 2 !== 0) return m.reply('❌ Reward format is invalid. Reward must be pairs of <name value>.')

         let rewards = {}
         for (let i = 0; i < rewardArgs.length; i += 2) {
            let name = rewardArgs[i].toLowerCase()
            let value = Number(rewardArgs[i + 1])

            if (!validRewards.includes(name)) return m.reply(`❌ Invalid reward: *${name}*\nValid: ${validRewards.join(', ')}`)

            if (isNaN(value) || value < 1) return m.reply(`❌ Value for *${name}* must be a positive number.`)

            rewards[name] = value
         }

         const max_usage = Number(usageText)
         if (isNaN(max_usage) || max_usage <= 0) return m.reply('❌ Max usage must be a number.')

         const code = codeText.replace(/\s+/g, '')
         if (!code) return m.reply('❌ Code cannot be empty.')

         const duplicate = setting.codes.find(c => c.code.toLowerCase() === code.toLowerCase())
         if (duplicate) return m.reply(`❌ Redeem code *${code}* already exists! Use a different code.`)

         if (setting.codes.length >= 10) return m.reply('❌ Code database is full. Delete old codes first.')

         const data = {
            code,
            rewards,
            max_usage,
            redeemed: [],
            created_at: Date.now()
         }

         setting.codes.push(data)

         let txt = `🎉 *REDEEM CODE CREATED* :\n\n`
         txt += `◦ Code : *${code}*\n`
         txt += `◦ Max Usage : *${max_usage}*\n`
         txt += `◦ Created At : ${format(new Date(data.created_at), 'dd/MM/yy HH:mm:ss')}\n\n`

         txt += `🎁 Rewards :\n`
         for (let [k, v] of Object.entries(rewards)) {
            txt += `◦ ${Utils.ucword(k)} : *${v}*\n`
         }

         m.reply(txt.trim())
      } catch (e) {
         m.reply(e.message || Utils.jsonFormat(e))
      }
   },
   owner: true
}

const explain = (m, { client, isPrefix, command }) => {
   let teks = `• *Usage Example* :\n\n`
   teks += `${isPrefix + command} limit 10 | 10 | neoxr51\n`
   teks += `${isPrefix + command} point 100 limit 20 pocket 1 | 4 | free68\n`
   teks += `${isPrefix + command} premium 12 | 4 | prem12d`
   return client.reply(m.chat, teks, m)
}
