export const run = {
   usage: ['antiporn', 'autoreply', 'antidelete', 'antiforward', 'autosticker', 'adminonly', 'antibot', 'antitagsw', 'antilink', 'antivirtex', 'restrict', 'left', 'filter', 'localonly', 'welcome', 'game', 'mysterybox', 'captcha'],
   use: 'on / off',
   category: 'admin tools',
   async: async (m, {
      client,
      args,
      command,
      isBotAdmin,
      groupSet: setting,
      Utils
   }) => {
      try {
         let type = command.toLowerCase()
         if (!isBotAdmin && /antiporn|antibot|antilink|antivirtex|filter|localonly|restrict|captcha/.test(type)) return client.reply(m.chat, global.status.botAdmin, m)
         if (!args || !args[0]) return client.reply(m.chat, `🚩 *Current status* : [ ${setting[type] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`, m)
         let option = args[0].toLowerCase()
         let optionList = ['on', 'off']
         if (!optionList.includes(option)) return client.reply(m.chat, `🚩 *Current status* : [ ${setting[type] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`, m)
         let status = option != 'on' ? false : true
         if (setting[type] == status) return client.reply(m.chat, Utils.texted('bold', `🚩 ${Utils.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} previously.`), m)
         setting[type] = status
         client.reply(m.chat, Utils.texted('bold', `🚩 ${Utils.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} successfully.`), m)
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   admin: true,
   group: true
}