export const run = {
   usage: ['stake', 'mystake'],
   use: 'symbol qty duration',
   category: 'trading',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      market,
      Utils
   }) => {
      const u = users.market || {}

      if (command === 'mystake') {
         market.processStaking(users) 

         if (!u.staking || u.staking.length === 0) return client.reply(m.chat, '❌ Tidak ada aset yang sedang di-stake.', m)

         let text = `〄 *ACTIVE STAKING*\n\n`

         u.staking.forEach(s => {
            const timeLeftMs = (s.start + s.duration) - Date.now()
            
            if (timeLeftMs <= 0) {
               text += `• *${s.sym}* : _Processing... (Coba lagi sesaat lagi)_\n`
               return
            }

            const timeLeftHours = Math.ceil(timeLeftMs / 3600000)
            const hoursTotal = s.duration / 3600000
            const apy = s.apy || 0.001
            const estimatedReward = s.qty * (apy * hoursTotal)

            text += `*${s.sym}* (${s.qty.toLocaleString()}x)\n`
            text += `◦ Durasi : ${timeLeftHours} jam | Reward : +${estimatedReward.toFixed(5)} ${s.sym}\n\n`
         })

         text += `> Catatan : _Aset ini dikunci dan menghasilkan bunga 0.1% per jam._`

         return client.reply(m.chat, text.trim(), m)
      }

      if (!args || args.length < 3) return client.reply(m.chat, Utils.example(isPrefix, command, 'BNB 10 24'), m)
      
      let [sym, qty, dur] = args
      sym = sym.toUpperCase()
      qty = Number(qty)
      dur = Number(dur)

      if (isNaN(qty) || qty <= 0) return client.reply(m.chat, `❌ Jumlah (qty) harus angka positif.`, m)
      if (isNaN(dur) || dur < 1) return client.reply(m.chat, `❌ Durasi minimal 1 jam.`, m)
      if (dur > 168) return client.reply(m.chat, `❌ Durasi maksimal 168 jam (7 hari).`, m)

      const r = market.stake(users, sym, qty, dur)
      client.reply(m.chat, r.msg, m)
   },
   error: false
}