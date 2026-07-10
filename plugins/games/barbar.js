import cron from 'node-cron'

export const run = {
   usage: ['barbar'],
   hidden: ['act'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      command,
      participants,
      users,
      setting,
      hostJid,
      clientJid,
      findJid,
      Utils
   }) => {
      client.barbar = client.barbar ? client.barbar : []
      if (users.point == 0) return client.reply(m.chat, Utils.texted('bold', `🚩 Kamu tidak punya point untuk bermain game Barbar`), m)
      if (users.point < 1000) return client.reply(m.chat, Utils.texted('bold', `🚩 Untuk bermain minimal kamu harus mempunyai 1000 point.`), m)
      if (command == 'barbar') return client.sendMessageModify(m.chat, help(isPrefix), m, {
         thumbnail: './media/image/fight.jpeg',
         largeThumb: true,
         type: 'preview-link',
         icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
      })
      let data = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
      const percent = Utils.randomInt(1, 10)
      const member = participants.map(v => v.id)
      const player = member.filter(v => data.find(x => x.jid == v) && data.find(x => x.jid == v).point != 0 && v != m.sender)
      const select = Utils.random(player)
      const act = Utils.random(['menusuk mata lawan menggunakan tusuk gigi sampai lawan meninggal',
         'membakar lawan sehingga menjadi orang hitam',
         'memakan lawan sampai lawan menjadi tulang berulang',
         'mengubur lawan hidup hidup seperti mayat',
         'memotong titit lawan',
         'aaaaaaaaaaaaaaaaaaa',
         'memindahkan dimensi lawan masuk ke dunia anime sehingga lawan menjadi gepeng',
         'menendang lawan sampai ke dunia kapur'
      ])
      const denda = parseInt(((50 / 100) * data.find(v => v.jid == m.sender).point).toFixed(0))
      // const keys = Utils.random([0, 1])
      // const dock = Utils.random([0, 1])
      let turned = client.barbar.find(player => player.id == m.sender)
      if (!turned) return client.reply(m.chat, Utils.texted('bold', `🚩 Berhasil masuk kedalam sesi.`), m).then(() => client.barbar.push({
         id: m.sender,
         win: 0,
         cooldown: 0
      }))
      const cooldown = new Date(turned.cooldown + 5000)
      if (new Date - turned.cooldown < 5000) return client.reply(m.chat, `💀 Cooldown 5 detik, denda *- ${Utils.formatNumber(denda)}* (50%)`, m).then(() => data.find(v => v.jid == m.sender).point -= denda)
      // const LevelE = Utils.level(data.find(v => v.jid == select).point)[0]
      // const LevelS = Utils.level(data.find(v => v.jid == m.sender).point)[0]
      if (client.barbar.length != 0) {
         cron.schedule('*/6 * * * * *', async () => client.barbar.map(v => v.win == 0))
      }
      turned.cooldown = new Date() * 1
      if (turned.win >= 5) {
         if (data.find(v => v.jid == m.sender).guard >= 10) {
            data.find(v => v.jid == m.sender).guard = 0
            if (turned.win > 0) turned.win -= 1
            let teks = `乂  *F I G H T*\n\n`
            teks += `➠ Lawan : @0 – Level : [ ∞ ]\n\n`
            teks += `*Draw!*, guard yang kamu miliki habis total dan menjadi orang hitam karena melawan pihak WhatsApp dengan level Infinity`
            client.reply(m.chat, teks, m)
         } else {
            const restrict = Utils.randomInt(5, 50)
            const point = parseInt(((restrict / 100) * data.find(v => v.jid == m.sender).point).toFixed(0))
            data.find(v => v.jid == m.sender).point -= point
            data.find(v => v.jid == m.sender).guard = 0
            if (turned.win > 0) turned.win -= 1
            let teks = `乂  *F I G H T*\n\n`
            teks += `➠ Lawan : @0 – Level : [ ∞ ]\n\n`
            teks += `*Lose!*, lawanmu adalah pihak WhatsApp dengan level infinity, guardmu habis total & pointmu berkurang *- ${Utils.formatNumber(point)}* point. (${restrict}%)`
            client.reply(m.chat, teks, m)
         }
      } else {
         if (Utils.level(data.find(v => v.jid == select).point)[0] > Utils.level(data.find(v => v.jid == m.sender).point)[0]) {
            if (data.find(v => v.jid == m.sender).guard >= 10) {
               if (data.find(v => v.jid == select).premium && data.find(v => v.jid == m.sender).premium) {
                  let teks = `乂  *F I G H T*\n\n`
                  teks += `➠ Lawan : @${select.replace(/@.+/g, '')} – Level : [ ${Utils.level(data.find(v => v.jid == select).point)[0]} ]\n\n`
                  teks += `*Draw!*, kamu dan lawanmu sama sama kaum elit global.`
                  client.reply(m.chat, teks, m)
               } else if (data.find(v => v.jid == select).premium) {
                  const point = parseInt(((percent / 100) * data.find(v => v.jid == m.sender).point).toFixed(0))
                  data.find(v => v.jid == m.sender).point -= point
                  data.find(v => v.jid == select).point += point
                  if (turned.win > 0) turned.win -= 1
                  let teks = `乂  *F I G H T*\n\n`
                  teks += `➠ Lawan : @${select.replace(/@.+/g, '')} – Level : [ ${Utils.level(data.find(v => v.jid == select).point)[0]} ]\n\n`
                  teks += `*Lose!*, lawanmu adalah bagian dari elit global, guard yang kamu miliki tidak berguna pointmu berkurang sebanyak *- ${Utils.formatNumber(point)}* point. (${percent}%)`
                  client.reply(m.chat, teks, m)
               } else {
                  data.find(v => v.jid == m.sender).guard -= 10
                  let teks = `乂  *F I G H T*\n\n`
                  teks += `➠ Lawan : @${select.replace(/@.+/g, '')} – Level : [ ${Utils.level(data.find(v => v.jid == select).point)[0]} ]\n\n`
                  teks += `*Draw!*, levelmu lebih rendah dari level lawan & karena kamu mempunyai guard pointmu aman.`
                  client.reply(m.chat, teks, m)
               }
            } else {
               if (data.find(v => v.jid == select).premium && data.find(v => v.jid == m.sender).premium) {
                  let teks = `乂  *F I G H T*\n\n`
                  teks += `➠ Lawan : @${select.replace(/@.+/g, '')} – Level : [ ${Utils.level(data.find(v => v.jid == select).point)[0]} ]\n\n`
                  teks += `*Draw!*, kamu dan lawanmu sama sama kaum elit global.`
                  client.reply(m.chat, teks, m)
               } else if (data.find(v => v.jid == select).premium) {
                  const point = parseInt(((percent / 100) * data.find(v => v.jid == m.sender).point).toFixed(0))
                  data.find(v => v.jid == m.sender).point -= point
                  data.find(v => v.jid == select).point += point
                  if (turned.win > 0) turned.win -= 1
                  let teks = `乂  *F I G H T*\n\n`
                  teks += `➠ Lawan : @${select.replace(/@.+/g, '')} – Level : [ ${Utils.level(data.find(v => v.jid == select).point)[0]} ]\n\n`
                  teks += `*Lose!*, lawanmu adalah bagian dari elit global, pointmu berkurang sebanyak *- ${Utils.formatNumber(point)}* point. (${percent}%)`
                  client.reply(m.chat, teks, m)
               } else {
                  const restrict = data.find(v => v.jid == m.sender).point > 500000000 ? 50 : percent
                  const point = parseInt(((restrict / 100) * data.find(v => v.jid == m.sender).point).toFixed(0))
                  data.find(v => v.jid == m.sender).point -= point
                  data.find(v => v.jid == select).point += point
                  if (turned.win > 0) turned.win -= 1
                  let teks = `乂  *F I G H T*\n\n`
                  teks += `➠ Lawan : @${select.replace(/@.+/g, '')} – Level : [ ${Utils.level(data.find(v => v.jid == select).point)[0]} ]\n\n`
                  teks += `*Lose!*, levelmu lebih rendah dari level lawan, pointmu berkurang sebanyak *- ${Utils.formatNumber(point)}* point. (${percent}%)`
                  client.reply(m.chat, teks, m)
               }
            }
         } else {
            if (data.find(v => v.jid == select).guard >= 10) {
               if (data.find(v => v.jid == select).premium && data.find(v => v.jid == m.sender).premium) {
                  let teks = `乂  *F I G H T*\n\n`
                  teks += `➠ Lawan : @${select.replace(/@.+/g, '')} – Level : [ ${Utils.level(data.find(v => v.jid == select).point)[0]} ]\n\n`
                  teks += `*Draw!*, kamu dan lawanmu sama sama kaum elit global.`
                  client.reply(m.chat, teks, m)
               } else if (data.find(v => v.jid == m.sender).premium) {
                  const point = parseInt(((percent / 100) * data.find(v => v.jid == select).point).toFixed(0))
                  data.find(v => v.jid == select).point -= point
                  data.find(v => v.jid == m.sender).point += point
                  turned.win += 1
                  let teks = `乂  *F I G H T*\n\n`
                  teks += `➠ Lawan : @${select.replace(/@.+/g, '')} – Level : [ ${Utils.level(data.find(v => v.jid == select).point)[0]} ]\n\n`
                  teks += `*Win!*, karena kamu bagian dari elit global, guard yang di miliki lawan tidak berguna & kamu mendapatkan *+ ${Utils.formatNumber(point)}* point. (${percent}%)`
                  client.reply(m.chat, teks, m)
               } else {
                  data.find(v => v.jid == select).guard -= 10
                  let teks = `乂  *F I G H T*\n\n`
                  teks += `➠ Lawan : @${select.replace(/@.+/g, '')} – Level : [ ${Utils.level(data.find(v => v.jid == select).point)[0]} ]\n\n`
                  teks += `*Draw!*, lawan terlindungi oleh guard.`
                  client.reply(m.chat, teks, m)
               }
            } else {
               const point = parseInt(((percent / 100) * data.find(v => v.jid == select).point).toFixed(0))
               data.find(v => v.jid == select).point -= point
               data.find(v => v.jid == m.sender).point += point
               turned.win += 1
               let teks = `乂  *F I G H T*\n\n`
               teks += `➠ Lawan : @${select.replace(/@.+/g, '')} – Level : [ ${Utils.level(data.find(v => v.jid == select).point)[0]} ]\n\n`
               teks += `*Win!*, kamu berhasil ${act}, dan mendapatkan *+ ${Utils.formatNumber(point)}* point. (${percent}%)`
               client.reply(m.chat, teks, m)
            }
         }
      }
   },
   group: true,
   limit: true,
   game: true
}

const help = prefix => {
   return `乂  *B A R B A R*

Game ini adalah game bertarung antar sesama anggota grup, berikut adalah alur permainannya :

➠ Point setiap anggota grup punya potensi untuk bisa di ambil oleh anggota lain dengan fitur ini.
➠ Pemain yang menang akan mendapatkan point pemain yang kalah.
➠ Point yang di tambahkan dan di kurangkan sebesar 1 - 10 persen.
➠ Point akan terlindungi apabila pemain mempunyai *Guard*, kirim *${prefix}buyguard* untuk membeli guard.
➠ Sekali proteksi di butuhkan 10 guard, beli guard sebanyak mungkin agar point tetap aman.
➠ Pemain dengan status Elit Global (Premium) bisa membypass guard lawan.
➠ Untuk bermain silahkan kirim perintah *${prefix}act*.
➠ 5 detik / eksekusi, jika spam akan terkena denda sebesar 50%.`
}