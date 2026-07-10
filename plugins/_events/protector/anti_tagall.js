export const run = {
   async: async (m, {
      client,
      isAdmin,
      isOwner
   }) => {
      try {
         if (!isOwner && !isAdmin && (m.mentionedJid.length > 10 || m.message?.[m.mtype || 'none']?.contextInfo?.nonJidMentions)) return client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      } catch (e) { }
   },
   error: false,
   group: true,
   botAdmin: true,
   exception: true
}