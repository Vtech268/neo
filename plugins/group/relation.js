export const run = {
   usage: ['relation'],
   hidden: ['pacaran', 'tembak', 'terima', 'tolak', 'putus', 'batal'],
   use: 'mention or reply',
   category: 'group',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      hostJid,
      findJid,
      clientJid,
      participants,
      Utils
   }) => {
      if (/pacaran|relation/.test(command)) return client.reply(m.chat, explain(isPrefix), m)
      let users = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
      let is_user = users.find(v => v.jid == m.sender)
      const id = m?.mentionedJid?.[0] || m?.quoted?.sender
      if (!id && ['tembak', 'batal', 'tembak', 'terima', 'tolak', 'putus'].includes(command)) return client.reply(m.chat, Utils.texted('bold', `🚩 Mention or reply chat target.`), m)
      const target = client.getJid(m, text)
      if (!target) return

      if (command === 'putus') {
         if (!is_user || !is_user.taken) return client.reply(m.chat, Utils.texted('bold', `❌ Kamu tidak sedang menjalin hubungan dengan siapapun.`), m)
         client.reply(m.chat, `✅ Berhasil putus dengan @${tagJid(is_user.partner)}`, m).then(() => {
            users.find(v => v.jid === is_user.partner).taken = false
            users.find(v => v.jid === is_user.partner).partner = ''
            is_user.taken = false
            is_user.partner = ''
         })
      } else if (command == 'batal') {
         if (!target) return client.reply(m.chat, Utils.texted('bold', `🚩 Mention or reply chat target.`), m)
         if (is_user.taken) return client.reply(m.chat, Utils.texted('bold', `❌ Kamu sedang berpacaran dengan @${tagJid(is_user.partner)}.`), m)
         if (!is_user.partner) return client.reply(m.chat, Utils.texted('bold', `❌ Kamu tidak sedang mengajak siapapun untuk berpacaran.`), m)
         if (is_user.taken && users.find(v =>
            v.jid == is_user.partner || v.lid == is_user.partner
         ).partner === m.sender) return client.reply(m.chat, Utils.texted('bold', `❌ Kamu sedang berpacaran dengan @${tagJid(is_user.partner)}.`), m)
         client.reply(m.chat, Utils.texted('bold', `🚩 Kamu sudah mengikhlaskan @${tagJid(is_user.partner)} karena dia tidak memberikan jawaban apapun.`), m)
         is_user.partner = ''
      } else if (/(tembak|terima|tolak)/.test(command)) {
         if (!target) return client.reply(m.chat, Utils.texted('bold', `🚩 Mention or reply chat target.`), m)
         // target = target?.split('@')?.pop() + '@s.whatssapp.net'
         let is_target = users.find(v =>
            v.jid === target || v.lid === target
         )
         if (target === client.decodeJid(client.user.id)) return client.reply(m.chat, Utils.texted('bold', `Jomok ?`), m)
         if (!is_target) return client.reply(m.chat, Utils.texted('bold', `❌ Nomor target tidak terdaftar di dalam database bot.`), m)
         if (target === m.sender) return client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
         if (!is_target.taken) is_target.taken = false
         if (!is_target.partner) is_target.partner = ''

         switch (command) {
            case 'tembak': {
               tagJid(target)
               if (!is_user.taken && is_user.partner && is_user.partner != target) return client.reply(m.chat, `⚠ Kamu sedang digantung oleh @${tagJid(is_user.partner)} karena dia belum memberikan jawaban, silahkan kirim *${isPrefix}batal* untuk membatalkan ajakan kepada @${tagJid(is_user.partner)}`, m)
               if (!is_user.taken && is_user.partner && is_user.partner == target) return client.reply(m.chat, `⚠ Sebelumnya kamu telah mengajak @${tagJid(is_user.partner)} untuk berpacaran dan belum ada jawaban.\n\nSilahkan untuk @${tagJid(target)} kirim *${isPrefix}terima <tag>* atau *${isPrefix}tolak <tag>*`, m)
               if (is_user.taken && is_user.partner) {
                  if (is_user.partner === target) return client.reply(m.chat, `🚩 Kamu dan @${tagJid(target)} sudah berstatus berpacaran.`, m)
                  let denda = Math.ceil(is_user.point / 100 * 20)
                  is_user.point -= denda
                  return client.reply(m.chat, `⚠ Kamu sudah berpacaran dengan @${tagJid(is_user.partner)}\n\nSilahkan putus terlebih dahulu ( *${isPrefix}putus* ) untuk menembak @${tagJid(target)}\n\n*Denda* : - ${Utils.formatNumber(denda)} (20%)`, m)
               } else if (is_target.taken && is_target.partner) {
                  let pacar = is_target.partner
                  if (is_target.taken && is_target.partner != m.sender) {
                     let denda = Math.ceil(is_user.point / 100 * 20)
                     is_user.point -= denda
                     return client.reply(m.chat, `⚠ @${tagJid(target)} sudah berpacaran dengan @${tagJid(pacar)}, silahkan cari orang lain untuk diajak berpacaran.\n\n*Denda* : - ${Utils.formatNumber(denda)} (20%)`, m)
                  } else {
                     let denda = Math.ceil(is_user.point / 100 * 20)
                     is_user.point -= denda
                     return client.reply(m.chat, `⚠ Kamu dan @${tagJid(target)} sudah berpacaran.\n\n*Denda* : - ${Utils.formatNumber(denda)} (20%)`, m)
                  }
               } else {
                  is_user.partner = target
                  return client.reply(m.chat, `Kamu baru saja mengajak @${tagJid(target)} untuk berpacaran.\n\nSilahkan untuk @${tagJid(target)} kirim *${isPrefix}terima <tag>* atau *${isPrefix}tolak <tag>*`, m)
               }
               break
            }

            case 'terima': {
               if (is_user.taken) return client.reply(m.chat, Utils.texted('bold', `❌ Kamu sedang berpacaran dengan @${tagJid(is_user.partner)}`), m)
               if (!is_target.taken && users.find(v =>
                  v.jid === target || v.lid === target
               ).partner != m.sender) return client.reply(m.chat, `Maaf, @${tagJid(target)} tidak mengajakmu untuk berpacaran.`, m)
               is_user.taken = true
               is_target.taken = true
               is_user.partner = target
               is_target.partner = m.sender
               return client.reply(m.chat, `Selamat, kamu resmi berpacaran dengan @${tagJid(target)}\n\nSemoga langgeng dan bahagia selalu @${tagJid(target)} 💓 @${tagJid(m.sender)} 🥳🥳🥳`, m, {
                  contextInfo: {
                     mentionedJid: participants?.map(v => v.id) || []
                  }
               })
               break
            }

            case 'tolak': {
               if (is_user.taken) return client.reply(m.chat, `Kamu sedang berpacaran dengan @${tagJid(is_user.partner)}.`, m)
               if (!is_target.taken && is_target.partner != m.sender) return client.reply(m.chat, `Maaf, @${tagJid(target)} tidak mengajakmu untuk berpacaran.`, m)
               is_target.partner = ''
               client.reply(m.chat, `✅ Kamu baru saja menolak @${tagJid(target)} 🗿🗿🗿`, m)
               break
            }
         }
      }
   },
   group: true,
   limit: true
}

const tagJid = jid => jid?.replace(/@.+/, '')

const explain = (prefix) => {
   return `乂  *P A C A R A N*
 
 “Fitur ini dibuat sebagai perantara untuk menyatakan perasaan kalian kepada sesama anggota grup, jika kalian suka dengan seseorang didalam grup kalian bisa menggunakan fitur ini.”
 
 ◦ *${prefix}tembak* -- Perintah ini untuk mengajakan / menembak seseorang digrup, cara menggukannya kirim *${prefix}tembak <tag>*.
 
 ◦ *${prefix}terima* -- Perintah ini untuk menerima ajakan seseorang dengan mengirimkan *${prefix}terima <tag>*.
 
 ◦ *${prefix}tolak* -- Perintah ini untuk menolak ajakan seseorang dengan mengirimkan *${prefix}tolak <tag>*.
 
 ◦ *${prefix}batal* -- Perintah ini untuk membatalkan ajakan apabila target tidak memberikan jawaban.
 
 ◦ *${prefix}putus* -- Perintah ini untuk memutuskan hubungan.
 
 ${global.footer}`
}