import os from 'node:os'

export const run = {
   usage: ['server'],
   category: 'miscs',
   async: async (m, {
      client,
      setting,
      Utils
   }) => {
      try {
         const json = await Utils.fetchAsJSON('http://ip-api.com/json')
         delete json.status
         delete json.query
         const memoryUsage = getMemoryStats()
         let caption = `乂  *S E R V E R*\n\n`
         caption += `┌  ◦  Directory : ${process.cwd()}\n`
         caption += `│  ◦  OS : ${os.type()} (${os.arch()} / ${os.release()})\n`
         caption += `│  ◦  Node : ${process.version}\n`
         caption += `│  ◦  Process : ${process.pid}\n`
         caption += `│  ◦  Core : ${os.cpus().length}\n`
         caption += `│  ◦  RAM : ${Utils.formatSize(process.memoryUsage().rss)} / ${Utils.formatSize(os.totalmem())}\n`
         caption += `│  ◦  Heap Total : ${memoryUsage.heapTotal}\n`
         caption += `│  ◦  Heap Used : ${memoryUsage.heapUsed}\n`
         caption += `│  ◦  External : ${memoryUsage.external}\n`
         caption += `│  ◦  Array Buffers : ${memoryUsage.arrayBuffers}\n`
         for (let key in json) caption += `│  ◦  ${Utils.ucword(key)} : ${json[key]}\n`
         caption += `│  ◦  Platform : ${os.platform()}\n`
         caption += `│  ◦  Uptime : ${Utils.toTime(os.uptime * 1000)}\n`
         caption += `└  ◦  Processor : ${os.cpus()[0].model}\n\n`
         caption += global.footer
         client.sendMessageModify(m.chat, caption, m, {
            ads: false,
            type: 'preview-link',
            largeThumb: true,
            thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
            icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}

function getMemoryStats() {
   const formatMemory = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`
   const memoryData = process.memoryUsage()

   return {
      rss: formatMemory(memoryData.rss),
      heapTotal: formatMemory(memoryData.heapTotal),
      heapUsed: formatMemory(memoryData.heapUsed),
      external: formatMemory(memoryData.external),
      arrayBuffers: formatMemory(memoryData.arrayBuffers || 0)
   }
}