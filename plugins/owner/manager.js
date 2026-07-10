export const run = {
   usage: ['+owner', '-owner', '-prem', 'block', 'unblock', 'ban', 'unban', '-except', '+except', 'deluser', '+mod', '-mod'],
   use: 'mention or reply',
   category: 'owner',
   async: async (m, {
      client,
      text,
      command,
      isOwner,
      hostJid,
      clientJid,
      findJid,
      Config,
      setting,
      Utils
   }) => {
      try {
         const bot = hostJid
            ? global.db
            : findJid.bot(clientJid)
               ? findJid.bot(clientJid)
               : global.db

         const user = bot?.data?.users || bot.users

         if (['+mod', '-mod', '+owner', '-owner'].includes(command) && !isOwner) return m.reply(global.status.owner)
         const target = client.getJid(m, text)
         if (!target) return
         const p = await client.onWhatsApp(target)
         if (!p.length) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid number.`), m)
         const jid = client.decodeJid(p[0].jid)
         const number = jid.replace(/@.+/, '')

         if (command == '+owner') { // add owner number
            let owners = setting.owners
            if (owners.includes(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Target is already the owner.`), m)
            if (bot?.plan && bot?.plan != 'none') {
               const choosenPlan = Config.bot_hosting.price_list.find(v => v.code === bot.plan)
               if (setting.owners.length > (choosenPlan.owner + (bot?.max_owner || 0))) return client.reply(m.chat, Utils.texted('bold', `🚩 You have reached the maximum number of owners for this plan.`), m)
            }
            owners.push(number)
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully added @${number} as owner.`), m)
         } else if (command == '-owner') { // remove owner number
            let owners = setting.owners
            if (!owners.includes(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Target is not owner.`), m)
            owners.forEach((data, index) => {
               if (data === number) owners.splice(index, 1)
            })
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully removing @${number} from owner list.`), m)
         } else if (command == '-prem') { // remove premium
            let data = user.find(v => v.jid == jid)
            if (typeof data == 'undefined') return client.reply(m.chat, Utils.texted('bold', `🚩 Can't find user data.`), m)
            if (!data.premium) return client.reply(m.chat, Utils.texted('bold', `🚩 Not a premium account.`), m)
            data.limit = Config.limit
            data.premium = false
            data.expired = 0
            client.reply(m.chat, Utils.texted('bold', `🚩 @${jid.replace(/@.+/, '')}'s premium status has been successfully deleted.`), m)
         } else if (command == 'block') { // block user
            if (jid == client.decodeJid(client.user.id)) return client.reply(m.chat, Utils.texted('bold', `🚩 ??`), m)
            client.updateBlockStatus(jid, 'block').then(res => m.reply(Utils.jsonFormat(res)))
         } else if (command == 'unblock') { // unblock user
            client.updateBlockStatus(jid, 'unblock').then(res => m.reply(Utils.jsonFormat(res)))
         } else if (command == 'ban') { // banned user
            let is_user = user
            let is_owner = [client.decodeJid(client.user.id).split`@`[0], Config.owner, ...setting.owners].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(jid)
            if (!is_user.some(v => v.jid == jid)) return client.reply(m.chat, Utils.texted('bold', `🚩 User data not found.`), m)
            if (is_owner) return client.reply(m.chat, Utils.texted('bold', `🚩 Can't banned owner number.`), m)
            if (jid == client.decodeJid(client.user.id)) return client.reply(m.chat, Utils.texted('bold', `🚩 ??`), m)
            if (is_user.find(v => v.jid == jid).banned) return client.reply(m.chat, Utils.texted('bold', `🚩 Target already banned.`), m)
            is_user.find(v => v.jid == jid).banned = true
            let banned = is_user.filter(v => v.banned).length
            client.reply(m.chat, `乂  *B A N N E D*\n\n*“Successfully added @${jid.split`@`[0]} into banned list.”*\n\n*Total : ${banned}*`, m)
         } else if (command == 'unban') { // unbanned user
            let is_user = user
            if (!is_user.some(v => v.jid == jid)) return client.reply(m.chat, Utils.texted('bold', `🚩 User data not found.`), m)
            if (!is_user.find(v => v.jid == jid).banned) return client.reply(m.chat, Utils.texted('bold', `🚩 Target not banned.`), m)
            is_user.find(v => v.jid == jid).banned = false
            let banned = is_user.filter(v => v.banned).length
            client.reply(m.chat, `乂  *U N B A N N E D*\n\n*“Succesfully removing @${jid.split`@`[0]} from banned list.”*\n\n*Total : ${banned}*`, m)
         } else if (command == '+except') { // add except
            let except = setting.except
            if (except.includes(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Target is already the except.`), m)
            except.push(number)
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully added @${number} into except list.`), m)
         } else if (command == '-except') { // remove except
            let except = setting.except
            if (!except.includes(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Target is not except.`), m)
            except.forEach((data, index) => {
               if (data === number) except.splice(index, 1)
            })
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully remove @${number} from except list.`), m)
         } else if (command == 'deluser') { // delete user
            let users = user.find(v => v.jid == jid)
            if (!users) return client.reply(m.chat, Utils.texted('bold', `🚩 User not found.`), m)
            Utils.removeItem(user, users)
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully remove @${number} from database.`), m)
         } else if (command == '+mod') { // add moderator number
            let moderators = setting.moderators
            if (moderators.includes(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Target is already the moderator.`), m)
            moderators.push(number)
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully added @${number} as moderator.`), m)
         } else if (command == '-mod') { // remove moderator number
            let moderators = setting.moderators
            if (!moderators.includes(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Target is not moderator.`), m)
            moderators.forEach((data, index) => {
               if (data === number) moderators.splice(index, 1)
            })
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully removing @${number} from moderator list.`), m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   moderator: true
}