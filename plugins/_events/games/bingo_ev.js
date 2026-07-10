export const run = {
   async: async (m, {
      client,
      body,
      users,
      prefixes,
      Config,
      Utils
   }) => {
      try {
         var id = m.chat
         var reward = Utils.randomInt(Config.min_reward, Config.max_reward)
         client.bingo = client.bingo ? client.bingo : {}
         if (m.quoted && (m.quoted.sender != client.decodeJid(client.user.id) && m.quoted.sender != client.decodeJid(client.user.lid))) return
         if (m.quoted && /bingoskip/i.test(m.quoted.text)) {
            if (!(id in client.bingo) && /bingoskip/i.test(m.quoted.text)) return client.reply(m.chat, Utils.texted('bold', `🚩 Soal tersebut telah berakhir, silahkan kirim _${prefixes[0]}bingo_ untuk mendapatkan soal baru.`), m)
            if (body && !Utils.socmed(body)) {
               let json = JSON.parse(JSON.stringify(client.bingo[id][1]))
               const answer = body.toUpperCase()
               if ((client.bingo[id][3]).map(v => v.word).includes(answer)) return client.reply(m.chat, `💀 *"${answer}"* sudah terjawab!\n\nSilahkan cari kata lain, denda : *- ${Utils.formatNumber(reward)} Point*`, m).then(() => {
                  if (reward > users.point) {
                     users.point = 0
                  } else {
                     users.point -= reward
                  }
               })
               if (!json.answer.includes(answer)) return client.reply(m.chat, `🚩 Kata *"${answer}"* tidak ada!`, m)
               client.bingo[id][3].push({
                  word: answer,
                  point: reward
               })
               if ((client.bingo[id][3]).length === json.answer.length) {
                  let i = 0
                  let teks = `乂  *B I N G O*\n\n`
                  teks += `Cari *${json.answer.length}* kata dalam KBBI yang terdapat pada huruf acak dibawah ini dengan arah pencarian Vertical, Horizontal & Diagonal :\n\n`
                  for (let v of json.question) {
                     teks += '`' + v.split('').join(' ') + '`\n'
                  }
                  teks += `\n`
                  for (let v of json.answer) {
                     i += 1
                     if ((client.bingo[m.chat][3]).map(x => x.word).includes(v)) {
                        teks += `${i}. ${v}\n`
                     } else {
                        teks += `${i}. ${'_'.repeat(v.length)}\n`
                     }
                  }
                  teks += `\n*BINGO!* Permainan selesai, silahkan kirim *${prefixes[0]}bingo* untuk mendapatkan soal baru\n`
                  teks += `Penjawab terakhir @${m.sender.replace(/@.+/, '')} mendapatkan +${Utils.formatter(client.bingo[m.chat][3].reduce((sum, item) => sum + item.point, 0))}`
                  client.reply(m.chat, teks, m).then(() => {
                     users.point += client.bingo[m.chat][3].reduce((sum, item) => sum + item.point, 0)
                     if (client.bingo?.[id]?.[2]) clearTimeout(client.bingo[id][2])
                     delete client.bingo[id]
                  })
               } else {
                  let i = 0
                  let teks = `乂  *B I N G O*\n\n`
                  teks += `Cari *${json.answer.length}* kata dalam KBBI yang terdapat pada huruf acak dibawah ini dengan arah pencarian Vertical, Horizontal & Diagonal :\n\n`
                  for (let v of json.question) {
                     teks += '`' + v.split('').join(' ') + '`\n'
                  }
                  teks += `\n`
                  for (let v of json.answer) {
                     i += 1
                     if ((client.bingo[m.chat][3]).map(x => x.word).includes(v)) {
                        teks += `${i}. ${v}\n`
                     } else {
                        teks += `${i}. ${'_'.repeat(v.length)}\n`
                     }
                  }
                  teks += `\n\nMasih ada *${json.answer.length - (client.bingo[id][3]).length}* kata yang belum ditemukan.\n`
                  teks += `Reply pesan ini untuk menjawab, kirim *${prefixes[0]}bingoskip* untuk menghapus sesi.`
                  client.reply(m.chat, teks, m)
               }
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