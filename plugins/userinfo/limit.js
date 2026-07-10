export const run = {
   usage: ['limit'],
   category: 'user info',
   async: async (m, {
      client,
      isPrefix,
      users,
      Utils
   }) => {
      let teks = `➠ Limit : *${Utils.formatter(users.limit)}*\n`
      teks += `➠ Game Limit : *${Utils.formatter(users.limit_game)}*`
      teks += `${!users.premium ? `\n\nTo get more limits, upgrade to a premium plan send *${isPrefix}buypremium*` : ''}`
      client.reply(m.chat, teks, m)
   },
   error: false
}