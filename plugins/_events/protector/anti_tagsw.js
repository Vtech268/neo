export const run = {
   async: async (m, {
      client,
      groupSet,
      isAdmin,
      Utils
   }) => {
      try {
         if (groupSet.antitagsw && !isAdmin && /groupStatus/.test(m.mtype)) {
            groupSet.member[m.sender].warning += 1
            let warning = groupSet.member[m.sender].warning
            if (warning >= 3) return client.reply(m.chat, Utils.texted('italic', `🚩 Warning : [ 3 / 3 ]`), m).then(() => {
               delete groupSet.member[m.sender].warning
               client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            }).then(() => client.sendMessage(m.chat, {
               delete: {
                  remoteJid: m.chat,
                  fromMe: false,
                  id: m.key.id,
                  participant: m.sender
               }
            }))
            let p = `乂  *W A R N I N G* \n\n`
            p += `You got +1 warning point : [ ${warning} / 3 ]\n\n`
            p += `> If you get 3 warning points you will be removed from this group.`
            client.reply(m.chat, p, m).then(() => client.sendMessage(m.chat, {
               delete: {
                  remoteJid: m.chat,
                  fromMe: false,
                  id: m.key.id,
                  participant: m.sender
               }
            }))
         }
      } catch (e) { }
   },
   error: false,
   group: true,
   botAdmin: true,
   exception: true
}