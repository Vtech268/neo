export const run = {
   usage: ['listban', 'listprem', 'listblock', 'listmod', 'listowner', 'listtoxic'],
   category: 'miscs',
   async: async (m, {
      client,
      command,
      isOwner,
      isModerator,
      hostJid,
      clientJid,
      findJid,
      Config,
      blockList,
      setting,
      Utils
   }) => {
      let users = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
      if (command === 'listban') {
         const data = users.filter(v => v.banned)
         if (data.length < 1) return m.reply(Utils.texted('bold', `🚩 Data empty.`))
         let text = `乂  *L I S T B A N*\n\n`
         text += data.map((v, i) => {
            if (i == 0) {
               return `┌  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
            } else if (i == data.length - 1) {
               return `└  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
            } else {
               return `│  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
            }
         }).join('\n')
         m.reply(text + '\n\n' + global.footer)
      } else if (command === 'listprem') {
         if (!isOwner) return m.reply(global.status.owner)
         const data = users.filter(v => v.premium)
         if (data.length < 1) return m.reply(Utils.texted('bold', `🚩 Data empty.`))
         let text = `乂  *L I S T P R E M*\n\n`
         text += data.map((v, i) => '   ┌ @' + client.decodeJid(v.jid).replace(/@.+/, '') + '\n   │ ' + Utils.texted('bold', 'Hitstat') + ' : ' + Utils.formatNumber(v.hit) + '\n   └ ' + Utils.texted('bold', 'Expired') + ' : ' + Utils.timeReverse(v.expired - new Date() * 1)).join`\n\n`
         m.reply(text + '\n\n' + global.footer)
      } else if (command === 'listblock') {
         if (blockList.length < 1) return m.reply(Utils.texted('bold', `🚩 Data empty.`))
         let text = `乂  *L I S T B L O C K*\n\n`
         text += blockList.map((v, i) => {
            if (i == 0) {
               return `┌  ◦  @${client.decodeJid(v).replace(/@.+/, '')}`
            } else if (i == blockList.length - 1) {
               return `└  ◦  @${client.decodeJid(v).replace(/@.+/, '')}`
            } else {
               return `│  ◦  @${client.decodeJid(v).replace(/@.+/, '')}`
            }
         }).join('\n')
         m.reply(text + '\n\n' + global.footer)
      } else if (command === 'listmod') {
         if (!isModerator) return m.reply(global.status.owner)
         const data = global.db.setting.moderators
         if (data.length < 1) return m.reply(Utils.texted('bold', `🚩 Data empty.`))
         let text = `乂  *L I S T M O D*\n\n`
         text += data.map((v, i) => {
            if (i == 0) {
               return `┌  ◦  @${v}`
            } else if (i == data.length - 1) {
               return `└  ◦  @${v}`
            } else {
               return `│  ◦  @${v}`
            }
         }).join('\n')
         m.reply(text + '\n\n' + global.footer)
      } else if (command === 'listowner') {
         if (!isModerator) return m.reply(global.status.owner)
         const data = [client.decodeJid(client.user.id).replace(/@.+/, ''), Config.owner, ...setting.owners]
         if (data.length < 1) return m.reply(Utils.texted('bold', `🚩 Data empty.`))
         let text = `乂  *L I S T O W E R*\n\n`
         text += data.map((v, i) => {
            if (i == 0) {
               return `┌  ◦  @${v}`
            } else if (i == data.length - 1) {
               return `└  ◦  @${v}`
            } else {
               return `│  ◦  @${v}`
            }
         }).join('\n')
         m.reply(text + '\n\n' + global.footer)
      } else if (command === 'listtoxic') {
         if (setting.toxic.length < 1) return m.reply(Utils.texted('bold', `🚩 Data empty.`))
         const data = setting.toxic.sort((a, b) => a.localeCompare(b))
         let text = `乂  *L I S T O X I C*\n\n`
         text += data.map((v, i) => {
            if (i == 0) {
               return `┌  ◦  ${v}`
            } else if (i == data.length - 1) {
               return `└  ◦  ${v}`
            } else {
               return `│  ◦  ${v}`
            }
         }).join('\n')
         m.reply(text + '\n\n' + global.footer)
      }
   },
   error: false
}