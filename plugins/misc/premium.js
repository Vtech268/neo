export const run = {
   usage: ['premium'],
   category: 'miscs',
   async: async (m, {
      client,
      isPrefix,
      setting,
      plugins,
      Utils
   }) => {
      let cmd = Object.entries(plugins).filter(([_, v]) => v.run.usage && v.run.premium && !setting.hidden.includes(v.run?.category?.toLowerCase()))
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
            return `┌  ◦  ${isPrefix + v.usage} ${v.use}`
         } else if (i == commands.sort((a, b) => a.usage.localeCompare(b.usage)).length - 1) {
            return `└  ◦  ${isPrefix + v.usage} ${v.use}`
         } else {
            return `│  ◦  ${isPrefix + v.usage} ${v.use}`
         }
      }).join('\n')
      let pr = `乂  *P R E M I U M*\n\n`
      pr += `> Upgrade to premium plan only Rp. 20,000,- to get 1K limits for 1 month.\n\n`
      pr += print
      pr += `\n\n> If you want to buy contact *${isPrefix}owner*`
      client.reply(m.chat, pr?.trim(), m)
   },
   error: false
}