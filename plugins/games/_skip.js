export const run = {
   usage: ['brainskip', 'bingoskip', 'cryskip', 'ncskip', 'fiboskip', 'flagskip', 'picskip', 'quizskip', 'ridskip', 'letskip', 'skip', 'verbskip', 'songskip', 'wordskip', 'whoskip', 'pgskip', 'hangskip', 'cakskip', 'jktskip', 'flashskip'],
   async: async (m, {
      client,
      isPrefix,
      command,
      Utils
   }) => {
      var id = m.chat
      if (command == 'brainskip') {
         client.brainout = client.brainout ? client.brainout : {}
         if ((id in client.brainout)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan brainout berhasil di hapus.`), m).then(() => {
            if (client.brainout[id]) clearTimeout(client.brainout[id][2])
            delete client.brainout[id]
         })
      } else if (command == 'bingoskip') {
         client.bingo = client.bingo ? client.bingo : {}
         if ((id in client.bingo)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan bingo berhasil di hapus.`), m).then(() => {
            if (client.bingo[id]) clearTimeout(client.bingo[id][3])
            delete client.bingo[id]
         })
      } else if (command == 'fiboskip') {
         client.deret = client.deret ? client.deret : {}
         if ((id in client.deret)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan fibonacci berhasil di hapus.`), m).then(() => {
            if (client.deret[id]) clearTimeout(client.deret[id][3])
            delete client.deret[id]
         })
      } else if (command == 'cryskip') {
         client.cryptarithm = client.cryptarithm ? client.cryptarithm : {}
         if ((id in client.cryptarithm)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan cryptarithm berhasil di hapus.`), m).then(() => {
            if (client.cryptarithm[id]) clearTimeout(client.cryptarithm[id][3])
            delete client.cryptarithm[id]
         })
      } else if (command == 'ncskip') {
         client.numberchain = client.numberchain ? client.numberchain : {}
         if ((id in client.numberchain)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan number chain berhasil di hapus.`), m).then(() => {
            if (client.numberchain[id]) clearTimeout(client.numberchain[id].timeout)
            delete client.numberchain[id]
         })
      } else if (command == 'flagskip') {
         client.whatflag = client.whatflag ? client.whatflag : {}
         if ((id in client.whatflag)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan whatflag berhasil di hapus.`), m).then(() => {
            if (client.whatflag[id]) clearTimeout(client.whatflag[id][3])
            delete client.whatflag[id]
         })
      } else if (command == 'picskip') {
         client.whatpic = client.whatpic ? client.whatpic : {}
         if ((id in client.whatpic)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan whatpic berhasil di hapus.`), m).then(() => {
            if (client.whatpic[id]) clearTimeout(client.whatpic[id][2])
            delete client.whatpic[id]
         })
      } else if (command == 'quizskip') {
         client.quiz = client.quiz ? client.quiz : {}
         if ((id in client.quiz)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan quiz berhasil di hapus.`), m).then(() => {
            if (client.quiz[id]) clearTimeout(client.quiz[id][2])
            delete client.quiz[id]
         })
      } else if (command == 'ridskip') {
         client.riddle = client.riddle ? client.riddle : {}
         if ((id in client.riddle)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan riddle berhasil di hapus.`), m).then(() => {
            if (client.riddle[id]) clearTimeout(client.riddle[id][2])
            delete client.riddle[id]
         })
      } else if (command == 'skip') {
         client.math = client.math ? client.math : {}
         if ((id in client.math)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan math berhasil di hapus.`), m).then(() => {
            if (client.math[id]) clearTimeout(client.math[id][3])
            delete client.math[id]
         })
      } else if (command == 'verbskip') {
         client.verb = client.verb ? client.verb : {}
         if ((id in client.verb)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan verb berhasil di hapus.`), m).then(() => {
            if (client.verb[id]) clearTimeout(client.verb[id][3])
            delete client.verb[id]
         })
      } else if (command == 'songskip') {
         client.whatsong = client.whatsong ? client.whatsong : {}
         if ((id in client.whatsong)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan whatsong berhasil di hapus.`), m).then(() => {
            if (client.whatsong[id]) clearTimeout(client.whatsong[id][3])
            delete client.whatsong[id]
         })
      } else if (command == 'wordskip') {
         client.whatword = client.whatword ? client.whatword : {}
         if ((id in client.whatword)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan whatword berhasil di hapus.`), m).then(() => {
            if (client.whatword[id]) clearTimeout(client.whatword[id][2])
            delete client.whatword[id]
         })
      } else if (command == 'whoskip') {
         client.whoami = client.whoami ? client.whoami : {}
         if ((id in client.whoami)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan whoami berhasil di hapus.`), m).then(() => {
            if (client.whoami[id]) clearTimeout(client.whoami[id][2])
            delete client.whoami[id]
         })
      } else if (command == 'letskip') {
         client.letter = client.letter ? client.letter : {}
         if ((id in client.letter)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan letter berhasil di hapus.`), m).then(() => {
            if (client.letter[id]) clearTimeout(client.letter[id][3])
            delete client.letter[id]
         })
      } else if (command == 'pgskip') {
         client.pg = client.pg ? client.pg : {}
         if ((id in client.pg)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan pilihan ganda berhasil di hapus.`), m).then(() => {
            client.sendMessage(m.chat, {
               delete: {
                  remoteJid: m.chat,
                  fromMe: true,
                  id: client.pg[id][0].id,
                  participant: client.decodeJid(client.user.id)
               }
            }).then(() => {
               if (client.pg[id]) clearTimeout(client.pg[id][3])
               delete client.pg[id]
            })
         })
      } else if (command == 'hangskip') {
         client.hangman = client.hangman ? client.hangman : {}
         if ((id in client.hangman)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan hangman berhasil di hapus.`), m).then(() => {
            if (client.hangman[id]) clearTimeout(client.hangman[id][5])
            delete client.hangman[id]
         })
      } else if (command == 'cakskip') {
         client.caklontong = client.caklontong ? client.caklontong : {}
         if ((id in client.caklontong)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan caklontong berhasil di hapus.`), m).then(() => {
            if (client.caklontong[id]) clearTimeout(client.caklontong[id][2])
            delete client.caklontong[id]
         })
      } else if (command == 'jktskip') {
         client.jkt = client.jkt ? client.jkt : {}
         if ((id in client.jkt)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan tebak member jkt48 berhasil di hapus.`), m).then(() => {
            if (client.jkt[id]) clearTimeout(client.jkt[id][2])
            delete client.jkt[id]
         })
      } else if (command == 'flashskip') {
         client.flashnumber = client.flashnumber ? client.flashnumber : {}
         if ((id in client.flashnumber)) return client.reply(m.chat, Utils.texted('bold', `🚩 Sesi permainan flashnumber berhasil di hapus.`), m).then(() => {
            if (client.flashnumber[id]) clearTimeout(client.flashnumber[id][2])
            delete client.flashnumber[id]
         })
      }
   },
   group: true,
   limit: true,
   game: true
}