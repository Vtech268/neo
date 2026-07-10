export const run = {
   usage: ['faceswap'],
   hidden: ['fs', 'cancelswap'],
   category: 'ai',
   async: async (m, {
      client,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         client.faceswap = client?.faceswap || {}
         if (['fs', 'faceswap'].includes(command)) {
            if (!client.faceswap[m.sender]) {
               client.faceswap[m.sender] = {
                  id: Utils.makeId(8),
                  source_url: null,
                  target_url: null
               }
            }
            const fn = client.faceswap[m.sender]
            if (fn.source_url && fn.target_url) return client.reply(m.chat, Utils.texted('bold', `❌ Wait, on process...`), m)
            let pr = `[${!fn.source_url ? 1 : 2} / 2] : Upload photo ${!fn.source_url ? 'source' : 'target'} by replying to this message.\n`
            pr += `Send *${isPrefix}cancelswap* to cancel process.\n\n`
            pr += `ID : ${fn.id}`
            m.reply(pr)
         } else {
            if (!client.faceswap[m.sender]) return m.reply(Utils.texted('bold', `🚩 No process found.`))
            delete client.faceswap[m.sender]
            m.reply(Utils.texted('bold', `✅ Process canceled.`))
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}