export const run = {
   usage: ['-product'],
   use: 'id',
   category: 'store',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         setting.product = setting.product ? setting.product : []
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, '1'), m)
         const exists = setting.product.sort((a, b) => a.created_at - b.created_at)[Number(args[0]) - 1]
         if (!exists) return client.reply(m.chat, Utils.texted('bold', `🚩 Product does not exists.`), m)
         Utils.removeItem(setting.product, exists)
         client.reply(m.chat, Utils.texted('bold', `🚩 Product successfully removed.`), m)
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   owner: true
}