import { USD } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['bank', 'pocket'],
   hidden: ['saldo', 'atm', 'dompet'],
   category: 'user info',
   async: async (m, {
      client,
      isPrefix,
      command,
      users,
      Utils
   }) => {
      try {
         if (['pocket', 'dompet'].includes(command)) return client.reply(m.chat, `➠ Pocket : *${USD.format(users.pocket)}*\n\n> Pocket adalah dompet yang berisikan uang cash yang bisa di belanjakan langsung.`, m)
         if (['bank', 'saldo', 'atm'].includes(command)) return client.reply(m.chat, `➠ Balance : *${USD.format(users.balance)}*\n\n> Balance adalah uang yang terdapat di Bank/ATM untuk menggunakannya kamu harus menariknya terlebih dahulu dengan perintah *${isPrefix}wd amount*`, m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}