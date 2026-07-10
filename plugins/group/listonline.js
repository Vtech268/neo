export const run = {
   usage: ['listonline'],
   hidden: ['here'],
   category: 'group',
   async: async (m, {
      client,
      store,
      participants,
      Utils
   }) => {
      const online = [...Object.keys(store?.presences?.[m.chat] || {})]
      if (online.length < 1) return m.reply(Utils.texted('bold', `🚩 The system does not detect members who are online.`))
      const toJid = id => participants?.find(v =>
         v.lid === id || v.id === id
      )?.id || participants?.find(v =>
         v.lid === id || v.id === id
      )?.jid
      client.reply(m.chat, online.map(v => '◦  @' + toJid(v).replace(/@.+/, '')).join('\n'), m)
   },
   error: false,
   group: true
}