import { format } from 'date-fns'

export const run = {
   usage: ['botstat'],
   hidden: ['stat'],
   category: 'miscs',
   async: async (m, {
      client,
      blockList,
      setting,
      setting: system,
      hostJid,
      clientJid,
      findJid,
      plugins,
      statistic,
      Utils
   }) => {
      try {
         const data = global.db
         const users = hostJid
            ? data.users
            : findJid.bot(clientJid)?.data?.users || data.users
         const chats = hostJid
            ? data.chats
            : findJid.bot(clientJid)?.data?.chats || data.chats
         const groups = Object.keys(await client.groupFetchAllParticipating())
         const bot = findJid.bot(clientJid)
         const uptime = hostJid
            ? Utils.toTime(process.uptime() * 1000)
            : bot
               ? Utils.toTime(Date.now() - bot.last_connect)
               : Utils.toTime(process.uptime() * 1000)

         class Hit extends Array {
            total(key) {
               return this.reduce((a, b) => a + (b[key] || 0), 0)
            }
         }

         const cmd = Utils.arrayJoin(
            Object.values(Object.fromEntries(
               Object.entries(plugins).filter(([name, prop]) => prop.run.usage)
            )).map(v => v.run.usage)
         ).concat(
            Utils.arrayJoin(
               Object.values(Object.fromEntries(
                  Object.entries(plugins).filter(([name, prop]) => prop.run.hidden)
               )).map(v => v.run.hidden)
            )
         )

         const sum = new Hit(...Object.values(statistic))

         const stats = {
            users: users?.length || 0,
            chats: chats?.filter(v => v.jid && v.jid.endsWith('.net'))?.length || 0,
            groups: groups?.length || 0,
            premium: users?.filter(v => v.premium)?.length || 0,
            banned: users?.filter(v => v.banned)?.length || 0,
            players: data.players.length,
            bots: data.bots?.filter(v => v.is_connected)?.length || 0,
            blocked: blockList.length,
            mimic: setting.mimic.length,
            hitstat: sum.total('hitstat') || 0,
            cmd: cmd.length,
            traffic: {
               in: setting.inbound,
               out: setting.outbound
            },
            temp: await Utils.getFolderSize(`${process.cwd()}/temp`),
            uptime
         }

         client.sendMessageModify(m.chat, print(Utils, stats, system), m, {
            largeThumb: true,
            type: 'preview-link',
            thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
            icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}

const print = (Utils, stats, system) => {
   const formatCheck = val => Utils.texted('bold', val ? '[ √ ]' : '[ × ]')
   const formatNum = num => Utils.texted('bold', Utils.formatNumber(num))
   const formatSize = size => Utils.texted('bold', Utils.formatSize(size))
   const bold = text => Utils.texted('bold', text)

   const prefixText = system.multiprefix
      ? `( ${system.prefix.join(' ')} )`
      : `( ${system.onlyprefix} )`

   const resetAt = format(system.lastReset, 'dd/MM/yyyy HH:mm')

   // ────── BOT STATS ──────
   let botStats = ''
   botStats += `${formatNum(stats.groups)} Groups Joined\n`
   botStats += `${formatNum(stats.chats)} Personal Chats\n`
   botStats += `${formatNum(stats.users)} Users In Database\n`
   botStats += `${formatNum(stats.banned)} Users Banned\n`
   botStats += `${formatNum(stats.blocked)} Users Blocked\n`
   botStats += `${formatNum(stats.mimic)} Mimics Target\n`
   botStats += `${formatNum(stats.premium)} Premium Users\n`
   botStats += `${formatNum(stats.players)} RPG Players\n`
   botStats += `${formatNum(stats.bots)} Bot Connected\n`
   botStats += `${formatNum(stats.hitstat)} Commands Hit\n`
   botStats += `${formatSize(stats.temp)} ./temp Folder\n`
   botStats += `${formatSize(stats.traffic.in)} Inbound Traffic\n`
   botStats += `${formatSize(stats.traffic.out)} Outbound Traffic\n`
   botStats += `${Utils.texted('bold', Utils.formatter(stats.cmd))} Available Commands`
   if (system.style !== 2) botStats += `\nRuntime : ${bold(stats.uptime)}`

   // ────── SYSTEM STATS ──────
   let systemStats = ''
   systemStats += `${formatCheck(system.online)}  Always Online\n`
   systemStats += `${formatCheck(system.autobackup)}  Auto Backup\n`
   systemStats += `${formatCheck(system.autodownload)}  Auto Download\n`
   systemStats += `${formatCheck(system.antispam)}  Anti Spam\n`
   systemStats += `${formatCheck(system.chatbot)}  Chatbot\n`
   systemStats += `${formatCheck(system.debug)}  Debug Mode\n`
   systemStats += `${formatCheck(system.verify)}  Email Verification\n`
   systemStats += `${formatCheck(system.games)}  Game Features\n`
   systemStats += `${formatCheck(system.groupmode)}  Group Mode\n`
   systemStats += `${formatCheck(system.levelup)}  Level UP\n`
   systemStats += `${formatCheck(system.notifier)}  Notifier\n`
   systemStats += `${formatCheck(system.noprefix)}  No Prefix\n`
   systemStats += `${formatCheck(system.self)}  Self Mode\n`
   systemStats += `${formatCheck(process?.argv.includes('--server'))}  WhatsApp Gateway\n`
   systemStats += `Prefix : ${bold(prefixText)}`
   if (system.style !== 2) systemStats += `\nReset At : ${resetAt}`

   // ────── STYLE 2 (Box Layout) ──────
   if (system.style === 2) {
      let result = ''
      result += `–  *B O T S T A T*\n\n`
      result += `┌  ◦  ${botStats.replace(/\n/g, '\n│  ◦  ')}\n`
      result += `└  ◦  Runtime : ${bold(stats.uptime)}\n\n`
      result += `–  *S Y S T E M*\n\n`
      result += `┌  ◦  ${systemStats.replace(/\n/g, '\n│  ◦  ')}\n`
      result += `└  ◦  Reset At : ${resetAt}\n\n`
      result += `${global.footer}`
      return result.trim()
   }

   // ────── DEFAULT STYLE ──────
   let result = ''
   result += `乂  *B O T S T A T*\n\n`
   result += `\t◦  ${botStats.replace(/\n/g, '\n\t◦  ')}\n\n`
   result += `乂  *S Y S T E M*\n\n`
   result += `\t◦  ${systemStats.replace(/\n/g, '\n\t◦  ')}\n\n`
   result += `${global.footer}`
   return result.trim()
}