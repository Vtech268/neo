import { USD } from '../../lib/games/rpg-utils.js'
import { progressSlider } from '../../lib/canvas.js'

export const run = {
   usage: ['buyprem'],
   hidden: ['exchange'],
   use: 'code',
   category: 'user info',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      setting,
      Utils
   }) => {
      try {
         const money = users?.referrals?.reduce((sum, v) => sum + v.reward, 0) || 0
         const now = new Date * 1
         const packages = [{
            _id: '0D',
            name: 'FREE PLAN',
            price: 0,
            limit: 0,
            duration: 0
         }, {
            _id: '1D',
            name: 'PREMIUM 1 DAY',
            price: 30_000,
            limit: 50,
            duration: 86400000 * 1
         }, {
            _id: '3D',
            name: 'PREMIUM 3 DAY',
            price: 50_000,
            limit: 100,
            duration: 86400000 * 3
         }, {
            _id: '7D',
            name: 'PREMIUM 7 DAY',
            price: 100_000,
            limit: 250,
            duration: 86400000 * 7
         }, {
            _id: '30D',
            name: 'PREMIUM 30 DAY',
            price: 500_000,
            limit: 1000,
            duration: 86400000 * 30
         }]
         const image = progressSlider(money, packages)
         packages.shift()
         let p = `乂  *B U Y P R E M*\n\n`
         packages.map((v, i) => {
            p += `〄 ${v.name}\n`
            p += `    ◦  *Price* : ${USD.format(v.price)}\n`
            p += `    ◦  *Limit* : +${Utils.formatter(v.limit)}\n`
            p += `    ◦  *Command* : ${isPrefix + command} ${v._id}\n\n`
         })
         p += global.footer
         if (!args || !args[0]) return client.sendMessageModify(m.chat, p, m, {
            largeThumb: true,
            type: 'preview-link',
            thumbnail: image.buffer,
            icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
         })
         const pkg = packages.find(v => v._id == (args[0]).toUpperCase())
         if (!pkg) return client.reply(m.chat, Utils.texted('bold', `🚩 Package not found.`), m)
         if (Number(pkg.price) > money) return client.reply(m.chat, Utils.texted('bold', `🚩 Your referral balance is not enough for ${pkg.name}. Invite more friends to increase your balance.`), m)
         users.limit += pkg.limit
         users.expired += users.premium ? (pkg.duration) : (now + pkg.duration)
         users.premium = true
         users.referrals = users.referrals.map(ref => {
            if (pkg.price <= 0) return ref
            const toDeduct = Math.min(ref.reward, pkg.price)
            pkg.price -= toDeduct
            return {
               ...ref,
               reward: ref.reward - toDeduct
            }
         })
         client.reply(m.chat, Utils.texted('bold', `✅ Succesfully buying ${pkg.name} packages.`), m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}