export const run = {
   usage: ['toptrader'],
   category: 'trading',
   async: async (m, {
      hostJid,
      clientJid,
      findJid,
      market
   }) => {
      const data = global.db
      const users = hostJid
         ? data.users
         : findJid.bot(clientJid)?.data?.users || data.users
      const lb = market.getLeaderboardString(users)
      m.reply(lb.trim())
   },
   error: true
}
