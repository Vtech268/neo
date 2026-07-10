export const run = {
   usage: ['owner'],
   category: 'miscs',
   async: async (m, {
      client,
      Config,
      hostJid,
      clientJid,
      findJid,
   }) => {
      if (hostJid) {
         client.sendContact(m.chat, [{
            name: Config.owner_name,
            number: Config.owner,
            about: 'Owner & Creator'
         }], m, {
            org: Config.bot_hosting.name,
            website: process.env.DOMAIN,
            email: 'contact@neoxr.my.id'
         })
      } else {
         const fn = findJid.bot(clientJid)
         client.sendContact(m.chat, [{
            name: fn.connector.sessionOpts?.owner_name || 'Owner',
            number: String(fn.connector.sessionOpts.owner.replace(/@.+/, '')),
            about: 'Owner'
         }], m, {
            org: Config.bot_hosting.name,
            website: process.env.DOMAIN,
            email: 'contact@neoxr.my.id'
         })
      }
   },
   error: false
}