export const run = {
   usage: ['+warning', '-warning'],
   hidden: ['+warn', '-warn'],
   category: 'admin tools',
   async: async (m, {
      client,
      command,
      isPrefix,
      groupSet,
      Utils
   }) => {
      try {
         const mentionedUser = m.mentionedJid && m.mentionedJid.length > 0 ? m.mentionedJid[0] : m.quoted && m.quoted.sender ? m.quoted.sender : false
         if (mentionedUser === '0@s.whatsapp.net' || mentionedUser === '0@s.whatsapp.net') return client.reply(m.chat, Utils.texted('bold', '🚩 You cannot add warning points to that user.'), m)
         if (!mentionedUser) return client.reply(m.chat, Utils.texted('bold', '🚩 Mention/Reply the user whose warning you want to add or reduce.'), m)
         const targetUser = mentionedUser
         if (command == '+warning' || command == '+warn') {
            if (groupSet?.member?.[targetUser]) {
               groupSet.member[targetUser].warning += 1
               client.reply(m.chat, `⚠️ @${targetUser.split`@`[0]} warning: ${groupSet.member[targetUser].warning} / 5.`, m)
               if (groupSet?.member?.[targetUser]?.warning >= 5) {
                  setTimeout(async () => {
                     await new Promise(resolve => setTimeout(resolve, 1000))
                     await client.groupParticipantsUpdate(m.chat, [targetUser], 'remove').catch(() => {
                        client.reply(m.chat, Utils.texted('bold', '🚩 An error occurred while trying to remove the user from the group.'), m)
                     })
                     groupSet.member[targetUser].warning = 0
                  }, 1000)
               }
            } else {
               return client.reply(m.chat, Utils.texted('bold', '🚩 Cannot find user or group data.'), m)
            }
         } else if (command == '-warning' || command == '-warn') {
            if (groupSet?.member?.[targetUser]) {
               if (groupSet.member[targetUser].warning <= 0) {
                  return client.reply(m.chat, Utils.texted('bold', `🚩 @${targetUser.split`@`[0]} has no warning points.`), m)
               }
               groupSet.member[targetUser].warning -= 1
               client.reply(m.chat, `⚠️ @${targetUser.split`@`[0]} Warning : ${groupSet.member[targetUser].warning} / 5.`, m)
            } else {
               return client.reply(m.chat, Utils.texted('bold', '🚩 Cannot find user or group data.'), m)
            }
         } else {
            let teks = `• *Example* :\n\n`
            teks += `${isPrefix}-warning @0\n`
            teks += `${isPrefix}+warning @0`
            client.reply(m.chat, teks, m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   admin: true,
   group: true,
   botAdmin: true,
   cache: true
}