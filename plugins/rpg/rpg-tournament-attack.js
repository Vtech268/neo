export const run = {
   usage: ['attack'],
   hidden: ['atk'],
   use: 'target.skill',
   category: 'rpg',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         client.tournament = client.tournament || {}
         const room = m.chat
         const data = client.tournament?.[room]
         const game = data?.game

         if (!data || !data.running || !game) return client.reply(m.chat, '❌ Tidak ada pertandingan yang sedang berlangsung.', m)

         const [target, skill] = text.split('.').map(a => parseInt(a?.trim()) - 1)
         if (isNaN(target) || isNaN(skill)) return client.reply(m.chat, Utils.example(isPrefix, command, '2.1'), m)
         if (game.ended) return
         if (data.timeout) clearTimeout(data.timeout)

         const onTurn = v => {

            if (game.ended && v.winner) {
               let caption = `乂  *T O U R N A M E N T*\n\n`
               caption += `Permainan telah di mulai dengan peserta :\n\n`
               game.players.forEach((v, i) => {
                  const skill = global.db.players.find(x => x.jid === v.jid).tools
                  caption += `*${i + 1}.* @${v.jid.replace(/@.+/, '')}\n`
                  caption += `  ▦ Health : ${v.health}%\n`
                  caption += `  ▦ Stamina : ${v.stamina}\n`
                  caption += `  ▦ Skills : ${skill?.map((_, x) => x + 1)?.join(', ')}\n`
                  caption += `  ▦ Eliminated : ${(v.eliminatedBySkip || v.eliminated) ? '√' : '×'}\n\n`
               })
               caption += `${game.log?.slice(-1)}\n\n🏆 Permainan selesai! Pemenangnya : @${v.winner.replace(/@.+/, '')}`
               client.reply(m.chat, caption, m).then(async () => {
                  if (data.timeout) clearTimeout(data.timeout)
                  game.players.forEach((y, i) => {
                     const fn = global.db.players.find(x => x.jid === y.jid)
                     fn.stamina = y.stamina
                     fn.agility = y.agility
                     fn.strength = y.strength
                     fn.health = y.health
                     if (fn.jid === v.winner) {
                        fn.lucky = y.lucky + 1
                        fn.berserker.winner += 1
                     } else {
                        fn.lucky = y.lucky
                        fn.berserker.lose += 1
                     }
                  })
                  await Utils.delay(1000)
                  delete client.tournament[room]
               })

               return
            }

            if (game.ended) return

            if (!v.status) {
               client.reply(m.chat, '❌ Tidak ada pemain aktif atau semua gugur.', null)
               if (data.timeout) clearTimeout(data.timeout)
               delete client.tournament[room]
               return
            }

            if (v.status && v.jid) {
               let caption = `乂  *T O U R N A M E N T*\n\n`
               caption += `Permainan telah di mulai dengan peserta :\n\n`
               game.players.forEach((v, i) => {
                  const skill = global.db.players.find(x => x.jid === v.jid).tools
                  caption += `*${i + 1}.* @${v.jid.replace(/@.+/, '')}\n`
                  caption += `  ▦ Health : ${v.health}%\n`
                  caption += `  ▦ Skills : ${skill?.map((_, x) => x + 1)?.join(', ')}\n`
                  caption += `  ▦ Eliminated : ${(v.eliminatedBySkip || v.eliminated) ? '√' : '×'}\n\n`
               })
               const [x, y] = game.log?.slice(-2)
               if (x === y) {
                  caption += `〄 ${game.log?.slice(-1)}.`
               } else {
                  caption += `${game.log?.slice(-2)?.join('\n\n〄 ')}.`
               }
               m.reply(caption)
               if (data.interval) clearInterval(data.interval)
               if (data.timeout) clearTimeout(data.timeout)
               data.timeout = setTimeout(() => {
                  game.startTurn(onTurn)
               }, game.TURN_TIMEOUT + 500)
            }
         }

         const result = game.attack(m.sender, target, skill)

         if (result.winner) {
            let caption = `乂  *T O U R N A M E N T*\n\n`
            caption += `Permainan telah di mulai dengan peserta :\n\n`
            game.players.forEach((v, i) => {
               const skill = global.db.players.find(x => x.jid === v.jid).tools
               caption += `*${i + 1}.* @${v.jid.replace(/@.+/, '')}\n`
               caption += `  ▦ Health : ${v.health}%\n`
               caption += `  ▦ Skills : ${skill?.map((_, x) => x + 1)?.join(', ')}\n`
               caption += `  ▦ Eliminated : ${(v.eliminatedBySkip || v.eliminated) ? '√' : '×'}\n\n`
            })
            caption += `${result.msg}\n\n🏆 Permainan selesai! Pemenangnya : @${result.winner.replace(/@.+/, '')}`
            client.reply(m.chat, caption, m).then(async () => {
               if (data.timeout) clearTimeout(data.timeout)
               game.players.forEach((v, i) => {
                  const fn = global.db.players.find(x => x.jid === v.jid)
                  fn.stamina = v.stamina
                  fn.agility = v.agility
                  fn.strength = v.strength
                  fn.health = v.health
                  if (fn.jid === result.winner) {
                     fn.lucky = v.lucky + 1
                     fn.berserker.winner += 1
                  } else {
                     fn.lucky = v.lucky
                     fn.berserker.lose += 1
                  }
               })
               await Utils.delay(1000)
               delete client.tournament[room]
            })
            return
         }

         if (!result.status) return client.reply(m.chat, `❌ ${result.msg}`, m).then(async () => {
            await Utils.delay(1100)
            game.startTurn(onTurn)
         })

         game.startTurn(onTurn)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}