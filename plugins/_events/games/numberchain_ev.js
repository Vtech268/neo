export const run = {
   async: async (m, {
      client,
      body,
      users,
      prefixes,
      setting,
      Config,
      Utils
   }) => {
      try {
         var id = m.chat
         var reward = Utils.randomInt(Config.min_reward, Config.max_reward)
         client.numberchain = client.numberchain ? client.numberchain : {}
         if (m.quoted && (m.quoted.sender != client.decodeJid(client.user.id) && m.quoted.sender != client.decodeJid(client.user.lid))) return
         if (m.quoted && /ncskip/i.test(m.quoted.text)) {
            if (!(id in client.numberchain) && /ncskip/i.test(m.quoted.text)) return client.reply(m.chat, Utils.texted('bold', `🚩 Soal tersebut telah berakhir, silahkan kirim _${prefixes[0]}nc_ untuk mendapatkan soal baru.`), m)
            let fn = client.numberchain[id]
            let player = fn.leaderboard.find(v => v.jid === m.sender)
            if (String(body) === String(fn.quest[fn.choose - 1].answer)) {
               if (!player) {
                  fn.leaderboard.push({
                     jid: m.sender,
                     score: fn.quest[fn.choose - 1].mode === 'easy' ? Utils.randomInt(500, 5000) : fn.quest[fn.choose - 1].mode === 'hard' ? Utils.randomInt(5000, 10000) : Utils.randomInt(10000, 500000),
                     correctAns: 1,
                     wrongAns: 0,
                     problems: [fn.quest[fn.choose - 1]]
                  })
               } else {
                  if (player.wrongAns >= 3) return m.reply(`🤡 Kamu sudah tereliminasi karena 3x salah.`)
                  player.correctAns += 1
                  player.problems.push(fn.quest[fn.choose - 1])
                  player.score += fn.quest[fn.choose - 1].mode === 'easy' ? Utils.randomInt(500, 5000) : fn.quest[fn.choose - 1].mode === 'hard' ? Utils.randomInt(5000, 10000) : Utils.randomInt(10000, 500000)
               }
               fn.choose += 1
               if (fn.choose > fn.quest.length) {
                  const medal = i => i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : ''
                  let teks = `乂  *N U M B E R C H A I N*\n\n`
                  teks += `Leaderboard pemain : \n\n`
                  teks += fn.leaderboard.sort((a, b) => b.score - a.score).map((v, i) => `   ┌ @${v.jid.replace(/@.+/, '')} ${medal(i + 1)}\n   └ [ (√) : ${v.correctAns} – (×) : ${v.wrongAns} – Score : ${Utils.formatter(v.score)} ]`).join('\n\n') + '\n\n'
                  teks += `Soal : [ ${fn.quest.length} / ${fn.quest.length} ]\n`
                  teks += `Permainan selesai!`
                  m.reply(teks).then(() => {
                     fn.leaderboard.map(v => {
                        global.db.users.find(x => x.jid === v.jid).point += parseInt(v.score)
                     })
                     if (client.numberchain?.[id]?.timeout) clearTimeout(client.numberchain[id].timeout)
                     delete client.numberchain[id]
                  })
                  return
               }
               let teks = `乂  *N U M B E R C H A I N*\n\n`
               teks += `➠ *${fn.quest[fn.choose - 1].question}* = ?\n\n`
               teks += fn.leaderboard.sort((a, b) => b.score - a.score).map((v, i) => `   ┌ @${v.jid.replace(/@.+/, '')}\n   └ (√) : ${v.correctAns} – (×) : ${v.wrongAns} – Score : ${Utils.formatter(v.score)}`).join('\n\n') + '\n\n'
               teks += `Soal : [ ${fn.choose} / ${fn.quest.length} ]\n`
               teks += `Timeout : [ *${((fn.times / 1000) / 60)} menit* ]\n`
               teks += `Reply pesan ini untuk menjawab, kirim *${prefixes[0]}ncskip* untuk menghapus sesi (skor yang sudah hangus).`
               fn.m = await m.reply(teks)
            } else {
               if (!player) {
                  fn.leaderboard.push({
                     jid: m.sender,
                     score: 0,
                     correctAns: 0,
                     wrongAns: 1,
                     problems: []
                  })
               } else {
                  if (player.wrongAns >= 3) return m.reply(`🤡 Kamu tereliminasi karena 3x salah.`)
                  player.wrongAns += 1
               }
               client.sendSticker(m.chat, await Utils.fetchAsBuffer('./media/sticker/false.webp'), m, {
                  packname: setting.sk_pack,
                  author: setting.sk_author
               })
            }
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}