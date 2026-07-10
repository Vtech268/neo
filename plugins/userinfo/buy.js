export const run = {
   usage: ['buy', 'buyall', 'buygl', 'buyguard'],
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
         let maximum = 100,
            price = 50000
         if (command == 'buyall') {
            if (users.limit >= maximum) return client.reply(m.chat, Utils.texted('bold', `🚩 Sorry, you can't buy any more limits because you have reached maximum limit.`), m)
            if (users.point < price) return client.reply(m.chat, Utils.texted('bold', `🚩 You don't have enough points to buy limit.`), m)
            let amount = (users.point / price).toFixed(0)
            if ((users.limit + parseInt(amount)) >= maximum) return client.reply(m.chat, Utils.texted('bold', `🚩 Sorry, you can't buy any more limits because you have reached maximum limit.`), m)
            users.point -= price * parseInt(amount)
            users.limit += parseInt(amount)
            return client.reply(m.chat, `✅ You have purchased *${amount}* limit with *${Utils.h2k(price * parseInt(amount))}* points.`, m)
         } else if (command == 'buy') {
            if (users.limit >= maximum) return client.reply(m.chat, Utils.texted('bold', `🚩 Sorry, you can't buy any more limits because you have reached maximum limit.`), m)
            if (isNaN(args[0])) return client.reply(m.chat, Utils.example(isPrefix, command, '1'), m)
            if (args[0] < 1) return client.reply(m.chat, Utils.example(isPrefix, command, '1'), m)
            if (users.point >= price * parseInt(args[0])) {
               if ((users.limit + parseInt(args[0])) >= maximum) return client.reply(m.chat, Utils.texted('bold', `🚩 Limit amount you buy exceeds maximum limit.`), m)
               users.point -= price * parseInt(args[0])
               users.limit += parseInt(args[0])
               return client.reply(m.chat, `✅ You have purchased *${args[0]}* limit with *${Utils.h2k(price * args[0])}* points.`, m)
            } else {
               client.reply(m.chat, Utils.texted('bold', `🚩 You don't have enough points to buy ${Utils.formatNumber(args[0])} limit.`), m)
            }
         } else if (command == 'buygl') {
            if (users.limit_game >= maximum) return client.reply(m.chat, Utils.texted('bold', `🚩 Sorry, you can't buy any more game limits because you have reached maximum limit.`), m)
            if (isNaN(args[0])) return client.reply(m.chat, Utils.example(isPrefix, command, '1'), m)
            if (args[0] < 1) return client.reply(m.chat, Utils.example(isPrefix, command, '1'), m)
            if (users.point >= price * parseInt(args[0])) {
               if ((users.limit_game + parseInt(args[0])) >= maximum) return client.reply(m.chat, Utils.texted('bold', `🚩 Game Limit amount you buy exceeds maximum limit.`), m)
               users.point -= price * parseInt(args[0])
               users.limit_game += parseInt(args[0])
               return client.reply(m.chat, `✅ You have purchased *${args[0]}* game limit with *${Utils.h2k(price * args[0])}* points.`, m)
            } else {
               client.reply(m.chat, Utils.texted('bold', `🚩 You don't have enough points to buy ${Utils.formatNumber(args[0])} limit.`), m)
            }
         } else if (command == 'buyguard') {
            if (users.guard >= maximum) return client.reply(m.chat, Utils.texted('bold', `🚩 Sorry, you can't buy any more limits because you have reached maximum limit.`), m)
            if (isNaN(args[0])) return client.reply(m.chat, Utils.example(isPrefix, command, '1'), m)
            if (args[0] < 1) return client.reply(m.chat, Utils.example(isPrefix, command, '1'), m)
            if (users.point >= price * parseInt(args[0])) {
               if ((users.guard + parseInt(args[0])) >= maximum) return client.reply(m.chat, Utils.texted('bold', `🚩 Guard amount you buy exceeds maximum limit.`), m)
               users.point -= price * parseInt(args[0])
               users.guard += parseInt(args[0])
               return client.reply(m.chat, `✅ You have purchased *${args[0]}* guard with *${Utils.h2k(price * args[0])}* points.`, m)
            } else {
               client.reply(m.chat, Utils.texted('bold', `🚩 You don't have enough points to buy ${Utils.formatNumber(args[0])} guard`), m)
            }
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}