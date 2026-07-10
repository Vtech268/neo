export const run = {
   async: async (m, {
      client,
      body,
      groupSet,
      isAdmin
   }) => {
      try {
         if (!m.fromMe && body && groupSet.antiforward && !isAdmin) {
            const isForwarded = m?.message?.[m.mtype]?.contextInfo?.forwardedNewsletterMessageInfo
            if (isForwarded) return client.sendMessage(m.chat, {
               delete: {
                  remoteJid: m.chat,
                  fromMe: false,
                  id: m.key.id,
                  participant: m.sender
               }
            }).then(() => client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
         }
      } catch (e) { }
   },
   error: false,
   group: true,
   botAdmin: true,
   exception: true
}