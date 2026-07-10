export const run = {
   usage: ['-task', '-ad'],
   use: 'time',
   category: 'store',
   async: async (m, {
      client,
      text: time,
      isPrefix,
      command,
      setting,
      schedule,
      isOwner,
      Utils
   }) => {
      try {
         if (!isOwner && command === '-ad') return m.reply(global.db.owner)
         setting.schedules = setting.schedules ? setting.schedules : []
         if (!time) return client.reply(m.chat, Utils.example(isPrefix, command, '08:00'), m)
         const exists = setting.schedules.find(v => v.time === time?.trim())
         if (!exists) return client.reply(m.chat, Utils.texted('bold', `🚩 ${command === '-task' ? 'Task' : 'Ad'} does not exists.`), m)
         Utils.removeItem(setting.schedules, exists)
         await client.reply(m.chat, Utils.texted('bold', `🚩 ${command === '-task' ? 'Task' : 'Ad'} successfully removed.`), m)
         schedule.reloadDynamicTasks()
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}