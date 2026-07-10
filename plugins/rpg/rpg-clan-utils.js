import { format } from 'date-fns'
import { playerLvl, clanLvl } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['clan', 'myclan'],
   category: 'rpg',
   async: async (m, {
      client,
      command,
      Utils
   }) => {
      try {
         global.db.clans = global.db?.clans || []
         if (command === 'myclan') {
            const clan = global.db?.clans?.find(v => v.leader === m.sender) || global.db?.clans?.find(v => v.request.find(v => v.jid === m.sender && v.state === 'JOINED'))
            if (!clan) return m.reply(`🚩 Kamu tidak mempunyai clan.`)
            const member = clan.request?.filter(v => v.state === 'JOINED')
            const exp = (member?.length ? member.map(v => global.db.players.find(x => x.jid === v.jid)?.exp).reduce((a, b) => a + b, 0) : 0) + (global.db.players.find(x => x.jid === clan.leader)?.exp || 0)
            const { level, name } = clanLvl(parseInt(exp))
            if (!clan.created_at) clan.created_at = new Date
            let caption = `乂  *C L A N*\n\n`
            caption += `	◦  *Name* : ${Utils.ucword(clan.name)}\n`
            caption += `	◦  *Leader* : @${clan.leader.replace(/@.+/, '')}\n`
            caption += `	◦  *Member* : ${member?.length}\n`
            caption += `	◦  *EXP* : ${Utils.formatter(exp || 0)}\n`
            caption += `	◦  *Level* : ${level} (${name})\n`
            caption += `	◦  *Created at* : ${format(clan.created_at, 'EEEE, dd/MM/yy')}\n\n`
            if (member.length > 0) {
               caption += `乂  *M E M B E R*\n\n`
               clan.request.sort((a, b) => b.exp - a.exp).map((v, i) => {
                  const player = global?.db?.players?.find(x => x.jid === v.jid)
                  caption += `	*${i + 1}.* @${v.jid.replace(/@.+/, '')}\n`
                  caption += `    ▦ EXP : ${Utils.h2k(player?.exp || 0)}\n`
                  caption += `    ▦ Level : ${playerLvl(player?.exp || 0)}\n\n`
               })
            }
            caption += global.footer
            client.sendFile(m.chat, Buffer.from(clan.icon, 'base64'), 'icon.jpg', caption, m)
         } else if (command === 'clan') {
            if (global.db.clans?.length < 1) return m.reply(`🚩 Tidak ada clan yang terdaftar.`)
            let caption = `乂  *C L A N S*\n\n`
            global.db.clans.map((v, i) => {
               const member = v.request?.filter(v => v.state === 'JOINED')
               const exp =
                  ((v.request?.filter(r => r.state === 'JOINED') || [])
                     .map(r => global.db.players.find(p => p.jid === r.jid)?.exp ?? 0)
                     .reduce((a, b) => a + b, 0)) +
                  (global.db.players.find(p => p.jid === v.leader)?.exp ?? 0)
               if (!v.created_at) v.created_at = new Date
               const { level, name } = clanLvl(parseInt(exp))
               caption += `*${i + 1}.* ${Utils.ucword(v.name)}\n`
               caption += `	◦  *ID* : ${v.id}\n`
               caption += `	◦  *Leader* : @${v.leader.replace(/@.+/, '')}\n`
               caption += `	◦  *Member* : ${member?.length}\n`
               caption += `	◦  *EXP* : ${Utils.formatter(exp || 0)}\n`
               caption += `	◦  *Level* : ${level} (${name})\n`
               caption += `	◦  *Created at* : ${format(v.created_at, 'EEEE, dd/MM/yy')}\n\n`
            })
            caption += global.footer
            m.reply(caption)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true
}