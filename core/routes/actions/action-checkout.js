import { Utils, Config } from '@neoxr/wb'
import { receipt } from '../../../lib/canvas.js'
import { toJid } from '../../utils/index.js'
import { format } from 'date-fns'

export const routes = {
   category: 'action',
   path: '/action/checkout',
   parameter: ['plan_code'],
   method: 'post',
   execution: async (req, res, next) => {
      try {
         global.db.setting.redeem_codes = global.db.setting.redeem_codes || []
         let promoData = global.db.setting.redeem_codes

         const { plan_code, promo_code } = req.body
         const { jid, account } = req.session

         const bot = global.db.bots?.find(v => v.connector.sessionOpts.owner === jid)

         if (!bot)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot data not found for your session.'
            })

         const now = Date.now()

         const fnPlan = Config.bot_hosting.price_list.find(v => v.code === plan_code)
         if (!fnPlan)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Plan not found.'
            })

         let originalPrice = fnPlan.price
         let totalDiscount = 0
         let appliedPromo = null
         let promoType = null

         if (promo_code) {
            const promo = promoData.find(v => v.code === promo_code)

            if (!promo)
               return res.status(404).json({
                  creator: global.creator,
                  status: false,
                  message: 'Promo code not found.'
               })

            if (promo.type !== 'discount')
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'This code is not a discount promo.'
               })

            if (!promo.is_active)
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'This promo is no longer active.'
               })

            if (promo.expires_at > 0 && now > promo.expires_at)
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'This promo code has expired.'
               })

            if (promo.redeemed.length >= promo.limit.total)
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'This promo has reached its maximum usage limit.'
               })

            const userRedeemRecord = promo.redeemed.find(r => r.jid === bot.jid)
            const userRedeemCount = userRedeemRecord ? userRedeemRecord.count : 0

            if (userRedeemCount >= promo.limit.per_user)
               return res.status(403).json({
                  creator: global.creator,
                  status: false,
                  message: 'You have already used this promo code.'
               })

            if (userRedeemRecord) {
               userRedeemRecord.count++
               userRedeemRecord.at = now
            } else {
               promo.redeemed.push({
                  jid: bot.jid,
                  count: 1,
                  at: now
               })
            }

            const { type: discType, value: discValue, max: discMax } = promo.reward.discount
            if (discType === 'percent') {
               promoType = 'percent'
               totalDiscount = (originalPrice * discValue) / 100
               if (discMax > 0 && totalDiscount > discMax) totalDiscount = discMax
            } else {
               promoType = 'discount'
               totalDiscount = discValue
            }

            appliedPromo = promo.code
         }

         let finalPrice = promoType ? (promoType === 'percent' ? originalPrice - totalDiscount : totalDiscount) : originalPrice
         if (promoType && finalPrice < 0) finalPrice = 0

         const paymentData = {
            plan_code: plan_code,
            promo_code: appliedPromo
         }

         const getCurrencySymbol = (currency = Config.bot_hosting.currency) => {
            try {
               return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency
               })
                  .formatToParts(1)
                  .find(part => part.type === 'currency')?.value || '$'
            } catch {
               return '$'
            }
         }

         const STORE_MAP = {
            id: Utils.makeId(8).toUpperCase(),
            name: 'NEOXR CREATIVE',
         }

         const data = {
            store: STORE_MAP.name,
            invoice: STORE_MAP.id,
            date: format(new Date(), 'dd/MM/yy'),
            status: 'unpaid', // paid | unpaid | canceled
            qr: null,
            items: [
               { name: `${fnPlan.name} Plan`, unit: `${fnPlan.days}D`, price: Utils.formatter(finalPrice) }
            ],
            total: finalPrice
         }

         const json = await receipt(data)

         let caption = `乂  *I N V O I C E*\n\n`
         caption += `◦ *ID* : ${data.invoice}\n`
         caption += `◦ *Account ID* : ${account}\n`
         caption += `◦ *Bot* : @${bot.jid.replace(/@.+/, '')}\n`
         caption += `◦ *Owner* : @${bot.connector.sessionOpts.owner.replace(/@.+/, '')}\n`
         caption += `◦ *Plan* : ${fnPlan.name}\n`
         caption += `◦ *Amount* : ${getCurrencySymbol()} ${Utils.formatter(finalPrice)},-\n\n`
         caption += global.footer

         req.bot.sock.sendFile(toJid(Config.owner), json.buffer, 'image.png', caption).then(() => {
            if (client.receipt) client.receipt.push(data)
         })

         res.status(200).json({
            creator: global.creator,
            status: true,
            message: 'Order created, redirecting...',
            data: paymentData
         })
      } catch (e) {
         Utils.printError(e)
         if (!res.headersSent) {
            res.status(500).json({
               creator: global.creator,
               status: false,
               message: e.message
            })
         }
      }
   },
   error: false,
   login: true
}