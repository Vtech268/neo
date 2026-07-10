import generateMathProblems from '../../lib/games/numberchain.js'

export const run = {
   usage: ['numberchain'],
   hidden: ['nc'],
   use: '100 - 1000',
   category: 'games',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      hostJid,
      clientJid,
      findJid,
      store,
      users,
      Utils
   }) => {
      try {
         if (users.point < 1000) return client.reply(m.chat, Utils.texted('bold', `🚩 Point yang kamu miliki tidak cukup untuk bermain game Number Chain.`), m)
         client.numberchain = client.numberchain ? client.numberchain : {}
         let timeout = 300000, id = m.chat
         if (id in client.numberchain) return client.reply(m.chat, '*^ soal ini belum terjawab!*', client.numberchain?.[id]?.m)
         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, '167'))
         if (isNaN(args[0])) return client.reply(m.chat, Utils.texted('bold', `🚩 Must be a number.`), m)
         if (Number(args[0]) < 100 || Number(args[0]) > 1000) return client.reply(m.chat, Utils.texted('bold', `🚩 Min 100 and Max 1000.`), m)
         const quest = generateMathProblems(args[0], 10)
         let teks = `乂  *N U M B E R C H A I N*\n\n`
         teks += `➠ *${quest[0].question}* = ?\n\n`
         teks += `Soal : [ 1 / ${quest.length} ]\n`
         teks += `Timeout : [ *${((timeout / 1000) / 60)} menit* ]\n`
         teks += `Reply pesan ini untuk menjawab, kirim *${isPrefix}ncskip* untuk menghapus sesi.`
         client.numberchain[id] = {
            m: await client.reply(m.chat, teks, m),
            leaderboard: [{
               jid: m.sender,
               score: 0,
               correctAns: 0,
               wrongAns: 0,
               problems: []
            }],
            choose: 1,
            quest,
            times: timeout,
            timeout: setTimeout(async () => {
               const msg = await store.loadMessage(m.chat, client.numberchain[id].m)
               if (client.numberchain[id]) {
                  const medal = i => i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : ''
                  const fn = client.numberchain[id]
                  let tm = `乂  *N U M B E R C H A I N*\n\n`
                  tm += `Leaderboard pemain : \n\n`
                  tm += fn.leaderboard.sort((a, b) => b.score - a.score).map((v, i) => `   ┌ @${v.jid.replace(/@.+/, '')} ${medal(i + 1)}\n   └ [ (√) : ${v.correctAns} – (×) : ${v.wrongAns} – Score : ${Utils.formatter(v.score)} ]`).join('\n\n') + '\n\n'
                  tm += `Soal : [ ${fn.choose} / ${fn.quest.length} ]\n`
                  tm += `Waktu habis permainan selesai!`
                  m.reply(tm).then(() => {
                     fn.leaderboard.map(v => {
                        let users = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
                        users.find(x => x.jid === v.jid).point += parseInt(v.score)
                     })
                     clearTimeout(client.numberchain[id].timeout)
                     delete client.numberchain[id]
                  })
               }
            }, timeout)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   group: true,
   limit: true,
   game: true
}