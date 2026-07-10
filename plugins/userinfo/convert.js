export const run = {
   usage: ['convert'],
   use: 'amount',
   category: 'user info',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      Utils
   }) => {
      try {
         const USD = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
         })
         let maximum = 1000000,
            kurs = 250 // $1 = 250 Point
         if (!args || !args[0]) {
            if ((users.pocket * kurs) >= maximum) return client.reply(m.chat, Utils.texted('bold', `🚩 Jumlah point untuk di konversi melebihi batas maksimal yaitu 10K, lakukan konversi manual dengan perintah ${isPrefix}convert amount`), m)
            if (users.pocket < 1) return client.reply(m.chat, Utils.texted('bold', `🚩 Kamu tidak punya uang untuk melakukan konversi.`), m)
            let amount = (users.pocket / kurs).toFixed(0)
            users.point += users.pocket * kurs
            users.pocket = 0
            return client.reply(m.chat, `✅ Berhasil menkonversi *${USD.format(users.pocket)}* menjadi *${Utils.formatter(users.pocket * kurs)}* point.`, m)
         } else {
            if (isNaN(args[0])) return client.reply(m.chat, explain(isPrefix, command, kurs), m)
            if (args[0] < 1) return client.reply(m.chat, explain(isPrefix, command, kurs), m)
            if (users.pocket >= args[0]) {
               if ((args[0] * kurs) >= maximum) return client.reply(m.chat, Utils.texted('bold', `🚩 Jumlah point untuk di konversi melebihi batas maksimal yaitu 10K`), m)
               users.pocket -= parseInt(args[0])
               users.point += parseInt(args[0]) * kurs
               return client.reply(m.chat, `✅ Berhasil menkonversi *${USD.format(args[0])}* menjadi *${Utils.formatter(kurs * args[0])}* point.`, m)
            } else {
               client.reply(m.chat, Utils.texted('bold', `🚩 Nominal melebihi batas jumlah uang yang kamu punya, cek dengan mengirimkan perintah ${isPrefix}pocket`), m)
            }
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}


const explain = (prefix, command, kurs) => {
   return `Konversi uang menjadi point dengan kurs *$1 = ${kurs} point*, berikut adalah penjelasannya :

1. ${prefix + command} -- menkonversi seluruh uang
2. ${prefix + command} amount -- menkonversi dengan memberikan jumlah uang
Contoh : ${prefix + command} 5`
}