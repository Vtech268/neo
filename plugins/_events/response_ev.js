export const run = {
   async: async (m, {
      client,
      body,
      groupSet,
      Utils
   }) => {
      try {
         if (body && typeof body === 'string') {
            groupSet.response = groupSet.response ? groupSet.response : []
            const response = groupSet.response.find(v => v._id === body.toLowerCase())
            if (response) response.mediaUrl ? client.sendFile(m.chat, response.mediaUrl, '', response.response, m) : m.reply(response.response)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true
}