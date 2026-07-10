export const run = {
   async: async (m, {
      client,
      hostJid,
      clientJid,
      findJid,
      Config,
      Utils
   }) => {
      try {
         if (!global.clearDB) {
            global.clearDB = true
            setInterval(async () => {
               let database
               if (hostJid) {
                  database = global.db
               } else if (findJid.bot(clientJid)) {
                  database = findJid.bot(clientJid).data
               } else {
                  database = global.db
               }

               const INACTIVE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000 // 3 days
               const now = Date.now()

               if (database.users) {
                  for (let i = database.users.length - 1; i >= 0; i--) {
                     const user = database.users[i]

                     const isInactive = (now - user.lastseen) > INACTIVE_THRESHOLD_MS

                     const isNotProtected = !user.premium && !user.banned && user.point < 1000000

                     if (isInactive && isNotProtected) {
                        database.users.remove(user.jid)
                     }
                  }
               }

               if (database.chats) {
                  for (let i = database.chats.length - 1; i >= 0; i--) {
                     let chat = database.chats[i]

                     if ((now - chat.lastseen) > INACTIVE_THRESHOLD_MS) {
                        database.chats.remove(chat.jid)
                     }
                  }
               }

               if (database.groups) {
                  for (let i = database.groups.length - 1; i >= 0; i--) {
                     const group = database.groups[i]

                     if ((now - group.activity) > INACTIVE_THRESHOLD_MS) {
                        database.groups.remove(group.jid)
                     }
                  }
               }

               if (global.db.players) {
                  for (let i = global.db.players.length - 1; i >= 0; i--) {
                     const player = global.db.players[i]

                     if (player.lastseen && (now - player.lastseen) > INACTIVE_THRESHOLD_MS) {

                        const user = database.users.find(u => u.jid === player.jid)
                        if (user) {
                           user.rpg = false
                        }

                        global.db.players.remove(player.jid)
                     }
                  }
               }
            }, 60_000)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}