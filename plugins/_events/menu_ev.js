export const run = {
   async: async (m, {
      client,
      body,
      prefixes,
      plugins,
      setting,
      Config,
      Utils
   }) => {
      try {
         client.menu = client.menu ? client.menu : {}
         if (Object.values(client.menu).length > 0) {
            m.reply(Utils.jsonFormat([m.body, body, m.text]))
            const category = client.menu.category.find(v => v.name === body.trim())
            if (!category) return m.reply('1')
            let cmd = Object.entries(plugins).filter(([_, v]) => v.run.usage && v.run.category == category._id && !setting.hidden.includes(v.run.category.toLowerCase()))
            let usage = Object.keys(Object.fromEntries(cmd))
            if (usage.length == 0) return
            let commands = []
            cmd.map(([_, v]) => {
               switch (v.run.usage.constructor.name) {
                  case 'Array':
                     v.run.usage.map(x => commands.push({
                        usage: x,
                        use: v.run.use ? Utils.texted('bold', v.run.use) : ''
                     }))
                     break
                  case 'String':
                     commands.push({
                        usage: v.run.usage,
                        use: v.run.use ? Utils.texted('bold', v.run.use) : ''
                     })
               }
            })
            let print = commands.sort((a, b) => a.usage.localeCompare(b.usage)).map((v, i) => {
               if (i == 0) {
                  return `┌  ◦  ${client.menu.prefix + v.usage} ${v.use}`
               } else if (i == commands.sort((a, b) => a.usage.localeCompare(b.usage)).length - 1) {
                  return `└  ◦  ${client.menu.prefix + v.usage} ${v.use}`
               } else {
                  return `│  ◦  ${client.menu.prefix + v.usage} ${v.use}`
               }
            }).join('\n')
            m.reply(print)
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}