import { JID, Config, Utils } from '@neoxr/wb'

const CLIENT_PROXY_FLAG = Symbol.for('@@clientProxyInjected')
const MESSAGE_PROXY_FLAG = Symbol.for('@@messageProxyInjected')

const MAX_DEPTH = 25
const stackMap = new Map()

function trackCall(name) {
   const depth = (stackMap.get(name) || 0) + 1
   stackMap.set(name, depth)

   if (depth > MAX_DEPTH) {
      Utils.printError(`[STACK WARNING] ${name} depth=${depth}`)
      console.trace()
      throw new Error(`Potential recursive call detected: ${name}`)
   }
}

function releaseCall(name) {
   const depth = (stackMap.get(name) || 1) - 1
   if (depth <= 0) stackMap.delete(name)
   else stackMap.set(name, depth)
}

const replacer = (string = '', { h, f }) => string
   .replace(new RegExp(global.header, 'g'), h || 'This is Header')
   .replace(new RegExp(global.footer, 'g'), f ? Utils.Styles(f) : 'This is Footer')

function resolveAds(client, text = '') {
   const bot = global.db.bots.find(v =>
      v.jid === client.decodeJid(client.user.id)
   )

   if (!bot) return ''

   const setup = global.db.setup

   const plan = Config.bot_hosting.price_list.find(v => v.code === bot.plan)

   return {
      header: (plan?.customize || bot.plan === 'none') ? bot.data?.setting?.header : global.header,
      ads: (bot.plan !== 'none' && plan?.ads) ? setup.ads : '',
      text: (plan?.customize || bot.plan === 'none') ? replacer(text, { h: bot.data?.setting?.header || global.header, f: bot.data?.setting?.footer || global.footer }) : text,
      footer: (plan?.customize || bot.plan === 'none') ? bot.data?.setting?.footer : global.footer,
   }
}

export function injectClientProxy(client) {
   if (client[CLIENT_PROXY_FLAG]) return client

   const proxy = new Proxy(client, {
      get(target, prop, receiver) {

         if (prop === 'reply') {
            return function (...args) {
               trackCall('client.reply')
               try {
                  const ad = resolveAds(target, args[1])
                  if (ad && args[1] && !String(args[1]).includes(ad)) {
                     args[1] = `${ad.text}\n\n${ad.ads}`.trim()
                  }

                  return target.reply.apply(target, args)
               } finally {
                  releaseCall('client.reply')
               }
            }
         }

         if (prop === 'sendFile') {
            return function (...args) {
               trackCall('client.sendFile')
               try {
                  const ad = resolveAds(target, args[3])
                  if (ad && args[3] && !String(args[3]).includes(ad)) {
                     args[3] = `${ad.text}\n\n${ad.ads}`.trim()
                  }
                  return target.sendFile.apply(target, args)
               } finally {
                  releaseCall('client.sendFile')
               }
            }
         }

         if (prop === 'sendMessageModify') {
            return function (...args) {
               trackCall('client.sendMessageModify')
               try {
                  const ad = resolveAds(target, args[1])
                  if (ad && args[1] && !String(args[1]).includes(ad)) {
                     args[1] = `${ad.text}\n\n${ad.ads}`.trim()
                  }

                  if (ad) {
                     args[3].title = ad.header
                  }

                  return target.sendMessageModify.apply(target, args)
               } finally {
                  releaseCall('client.sendMessageModify')
               }
            }
         }

         return Reflect.get(target, prop, receiver)
      }
   })

   Object.defineProperty(proxy, CLIENT_PROXY_FLAG, {
      value: true,
      enumerable: false
   })

   // console.log('[proxy] client proxy injected')
   return proxy
}

export function injectMessageProxy(m, client) {
   if (!m || m[MESSAGE_PROXY_FLAG]) return m
   const { hostJid } = JID(client)
   if (hostJid) return m

   const proxy = new Proxy(m, {
      get(target, prop, receiver) {

         if (prop === 'reply') {
            return function (text = '', options = {}) {
               trackCall('m.reply')
               try {
                  const ad = resolveAds(client, text)
                  const output = ad && text && !String(text).includes(ad)
                     ? `${ad.text}\n\n${ad.ads}`.trim()
                     : text

                  return target.reply.call(target, output, options)
               } finally {
                  releaseCall('m.reply')
               }
            }
         }

         return Reflect.get(target, prop, receiver)
      }
   })

   Object.defineProperty(proxy, MESSAGE_PROXY_FLAG, {
      value: true,
      enumerable: false
   })

   return proxy
}