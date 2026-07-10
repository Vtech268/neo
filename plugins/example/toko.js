import fs from 'fs'

export const run = {
   usage: ['lordsmenu', 'settingbot', 'settinggf', 'payment', 'kode', 'listgf'],
   category: 'example',

   async: async (m, {
      client,
      isPrefix,
      command,
      setting,
      Utils,
      Config
   }) => {

      try {

         switch (command) {

            // MENU TOKO
            case 'lordsmenu':

               const buttons = [{
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                     display_text: 'Runtime',
                     id: `.run`,
                     icon: 'REVIEW'
                  }),
               }, {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                     title: 'Tap Here!',
                     sections: [{
                        rows: [{

                           title: '⚙️ SETTING BOT UMUM',
                           id: `.settingbot`

                        }, {

                           title: '🏰 SETTING GUILD FESTIFAL',
                           id: `.settinggf`

                        }, {

                           title: '📖 KODE PERINTAH',
                           id: `.kode`

                        }, {

                           title: '📋 LIST MISI GUILD FEST',
                           id: `.listgf`

                        }, {

                           title: '💳 PEMBAYARAN',
                           id: `.payment`

                        }]
                     }],
                     icon: 'DEFAULT'
                  })
               }]

               client.sendIAMessage(m.chat, buttons, m, {
                  header: '======LORDS MOBILE======',
                  content: `
1. ⚙️ SETTING BOT
2. 🏰 SETTING GUILD FESTIVAL
3. 📖 KODE PERINTAH
4. 📋 LIST MISI GUILD FEST
5. 💳 PEMBAYARAN
                  `,
                  v2: true,
                  footer: global.footer,
                  media: Utils.isUrl(setting.cover)
                     ? setting.cover
                     : Buffer.from(setting.cover, 'base64'),
               })

            break


            // SETTING BOT
            case 'settingbot':

               client.reply(m.chat, `
*⚙️SETTING BOT*

🔹Nama akun
- 

🔹SETTING BOT
- 
 
\`\`\`Harap tunggu admin hingga react 👍 atau\`\`\`
*DONE*
               `, m)

            break


            // SETTING GUILD FESTIVAL
            case 'settinggf':

               client.reply(m.chat, `
*⚙️SETTING GF*

🔹Nama akun
- 
- 
- 

*AMBIL MISI*

🔹MISI SOLO 120%
- 
- 
- 

🔹MISI SOLO 200%
- 
- 
- 

🔹MISI KLAN/GUILD
- 
- 
- 

*HAPUS MISI*
- 
- 
- 
- 
- 
- 

Note :
1. MISI SOLO selain misi yang dipilih akan otomatis saya hapus
2. MISI GUILD/CLAN akan saya atur sesuai permintaan.

\`\`\`Harap tunggu admin hingga react 👍 atau\`\`\`
*DONE*
               `, m)

            break


            // KODE PERINTAH
            case 'kode':

               await client.sendMessage(m.chat, {
                  image: {
                     url: 'https://img.danquere.cloud/get/UvDNkM.jpg'
                  },
                  caption: `
*📖 KODE PERINTAH BOT*

Silahkan lihat daftar kode perintah pada gambar di atas.
                  `
               }, {
                  quoted: m
               })

            break


            // LIST MISI GF
            case 'listgf':

               await client.sendMessage(m.chat, {
                  image: {
                     url: 'https://img.danquere.cloud/get/vAz2ix.jpeg'
                  },
                  caption: `
*📋 LIST MISI GUILD FEST*

Silahkan lihat daftar misi Guild Fest pada gambar di atas.
                  `
               }, {
                  quoted: m
               })

            break


            // PEMBAYARAN
            case 'payment':

               await client.sendMessage(m.chat, {
                  image: {
                     url: 'https://img.danquere.cloud/get/fd1JzV.jpg'
                  },
                  caption: `
*💳 PEMBAYARAN VIA E-WALLET*

➡️ QRIS : 👆👆

➡️ DANA : 6289505587923

*🏦 PEMBAYARAN VIA BANK*

➡️ MANDIRI : 1710010758269
➡️ BRI : 627301009429509
➡️ BCA : 4030298026
➡️ SeaBank : 901940179421

A/N DANIEL DWI ADVENTA PUTRA

*NOTE :*
📌 WAJIB KIRIM BUKTI TRANSAKSI‼️
📌 PASTIKAN KIRIM BUKTI TRANSFER DI GRUB SAJA
                  `
               }, {
                  quoted: m
               })

            break

         }

      } catch (e) {

         client.reply(m.chat, Utils.jsonFormat(e), m)

      }
   },

   error: false
}

function generateDateTimes(durationMinutes = 10) {

   const start = new Date()

   const end = new Date(
      start.getTime() + durationMinutes * 60000
   )

   return {
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString()
   }
}
