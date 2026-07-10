import { format } from 'date-fns'
import { playerLvl, clanLvl } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['joinclan', 'canceljoin', 'claninfo'],
   use: 'id',
   category: 'rpg',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      players,
      Utils
   }) => {
      try {
         global.db.clans = global.db?.clans || []
         let clans = global.db.clans
         const [id] = args
         if (!id) return m.reply(Utils.example(isPrefix, command, '1234567'))
         if (command === 'joinclan') {
            if (players.exp < 4000) return m.reply(`🚩 Untuk masuk kedalam clan minimal harus berada di level *Journeyman*.`)
            const isReq = clans.map(v => v.request).flat(Infinity).map(v => v.jid).includes(m.sender) || clans.map(v => v.leader).includes(m.sender)
            if (isReq) return m.reply(`🚩 Tidak bisa masuk kedalam clan karena kamu sudah menjadi *(ketua / anggota / sedang menunggu acc)* masuk ke clan lain.`)
            let fn = clans.find(v => String(v.id) === id)
            if (!fn) return m.reply(`🚩 ID clan tidak terdaftar.`)
            fn.request.push({
               jid: m.sender,
               state: 'WAITING',
               requested_at: new Date()
            })
            m.reply(`✅ Permintaan bergabung kedalam clan *${Utils.ucword(fn.name)}* berhasil dikirim, tunggu sampai ketua dari clan menerima permintaanmu.\n\n> Kirim *${isPrefix}canceljoin ${args[0]}* untuk menghapus permintaan join.`).then(() => {
               const waiting = fn.request.filter(v => v.state === 'WAITING')
               let pr = `“Terdapat ${waiting.length} permintaan bergabung kedalam clan” :\n\n`
               fn.request.sort((a, b) => b.requested_at - a.requested_at).filter(v => v.state === 'WAITING').map((v, i) => {
                  const player = global.db.players.find(x => x.jid === v.jid)
                  pr += `*${i + 1}*. @${v.jid.replace(/@.+/, '')}\n`
                  pr += `  ▦ EXP : ${Utils.formatter(player.exp)}\n`
                  pr += `  ▦ Level : ${playerLvl(player.exp)}\n`
                  pr += `  ▦ Request at : ${format(v.requested_at, 'EEEE, MM/yy')}\n\n`
               })
               pr += `> Reply pesan dengan perintah *${isPrefix}cancel <no>* untuk membatalkan permintaan dan kirim *${isPrefix}accept <no>* untuk menerima permintaan.`
               client.reply(fn.leader, pr, null)
            })
         } else if (command === 'canceljoin') {
            const fn = clans.find(v => String(v.id) === id)
            if (!fn) return m.reply(`🚩 ID clan tidak terdaftar.`)
            const req = fn.request.find(v => v.jid === m.sender)
            if (!req) return m.reply(`🚩 Kamu tidak mengirim permintaan bergabung kedalam clan ini.`)
            if (req.state === 'WAITING') return m.reply(`✅ Permintaan bergabung kedalam clan *${Utils.ucword(fn.name)}* berhasil dibatalkan.`).then(() => {
               Utils.removeItem(fn.request, req)
            })
            if (req.state === 'JOINED') return m.reply(`✅ Berhasil keluar dari clan *${Utils.ucword(fn.name)}*.`).then(() => {
               Utils.removeItem(fn.request, req)
            })
         } else if (command === 'claninfo') {
            const fn = clans.find(v => String(v.id) === id)
            if (!fn) return m.reply(`🚩 ID clan tidak terdaftar.`)
            const member = fn.request?.filter(v => v.state === 'JOINED') || [];
            const memberExp = member
               .map(v => {
                  const player = global.db.players.find(x => x.jid === v.jid);
                  return player?.exp ?? 0; // pakai 0 kalau tidak ketemu
               })
               .reduce((a, b) => a + b, 0);
            const leaderExp = global.db.players.find(x => x.jid === fn.leader)?.exp ?? 0;
            const exp = memberExp + leaderExp
            const { level, name } = clanLvl(parseInt(exp))
            let caption = `乂  *C L A N*\n\n`
            caption += `	◦  *Name* : ${Utils.ucword(fn.name)}\n`
            caption += `	◦  *Leader* : @${fn.leader.replace(/@.+/, '')}\n`
            caption += `	◦  *Member* : ${member?.length}\n`
            caption += `	◦  *EXP* : ${Utils.formatter(exp)}\n`
            caption += `	◦  *Level* : ${level} (${name})\n`
            caption += `	◦  *Created at* : ${format(fn.created_at, 'EEEE, dd/MM/yy')}\n\n`
            caption += global.footer
            client.sendFile(m.chat, Buffer.from(fn.icon, 'base64'), 'icon.jpg', caption, m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   limit: true,
   game: true
}