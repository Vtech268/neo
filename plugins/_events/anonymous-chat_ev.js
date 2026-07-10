export const run = {
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         global.db.anon = global.db?.anon || {
             waiting: [],
             chats: []
         }
         if (global.db?.anon && global.db.anon?.chats?.length > 0) {
            const chat = global.db?.anon?.chats?.find(c => c.a === m.sender || c.b === m.sender)
            if (chat) {
               const to = chat.a === m.sender ? chat.b : chat.a
               client.copyNForward(to, m)
            }
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   private: true
}