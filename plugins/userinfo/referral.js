import { USD } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['referral'],
   hidden: ['ref'],
   category: 'user info',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      hostJid,
      clientJid,
      findJid,
      Utils
   }) => {
      try {
         const code = args?.[0]
         const limit = 5
         const reward = Utils.randomInt(100, 500)
         if (!code) {
            const explain =
               `\`Referral System - How It Works :\`\n\n` +
               `◦ Share your referral code : *${users?.refcode}*\n` +
               `◦ Your friend sends the command : *${isPrefix + command} ${users?.refcode}*\n` +
               `◦ Every time someone uses your code successfully, you instantly receive a reward 🎉\n` +
               `◦ Your friend also receives +${limit} limit\n` +
               `◦ Link : https://wa.me/${client.decodeJid(client.user.id).replace(/@.+/,'')}?text=${isPrefix + command}%20${users?.refcode}`
            return m.reply(explain)
         }
         const user = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
         const refUser = user.find(v => v.refcode === code)
         if (!refUser) return client.reply(m.chat, Utils.texted('bold', `🚩 Referral code not found.`), m)
         if (refUser.refcode === users.refcode) return client.reply(m.chat, Utils.texted('bold', `🚩 You can't refer yourself.`), m)
         if (refUser.referrals?.some(v => v.id === m.sender)) return client.reply(m.chat, Utils.texted('bold', `🚩 You have already used this referral.`), m)
         if (!Array.isArray(refUser.referrals)) refUser.referrals = []
         client.reply(m.chat, `✅ Referral successful! You get +${limit} limits.`, m).then(() => {
            users.limit += limit
            refUser.referrals.push({ id: m.sender, reward })
         })
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.texted('bold', `❌ An error occurred while processing your referral.`), m)
      }
   },
   error: false
}