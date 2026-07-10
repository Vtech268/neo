import { Config, Utils } from '@neoxr/wb'
import { parsingData } from '../../utils/index.js'
import { models } from '../../../lib/system/models.js'

export const routes = {
   category: 'action',
   path: '/action/update-setting',
   method: 'post',
   parameter: ['data'],
   execution: async (req, res, next) => {
      try {
         const { data: newSettings } = req.body

         if (!newSettings || typeof newSettings !== 'object')
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Invalid settings data provided'
            })

         const { type, jid } = req.session

         const data = parsingData(type, jid)

         if (!data)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot not found'
            })

         let { bot, setting } = data
         if (!setting) setting = {}
         if (!setting.chatbot_config) setting.chatbot_config = models.setting.chatbot_config || {
            apikey: { groq: '', gemini: '', cloudflare: { account: '', token: '' } },
            instruction: '',
            model: { groq: '', gemini: '', cloudflare: { image: '', text: '' } }
         }

         if (typeof setting.chatbot === 'undefined') setting.chatbot = false

         if (bot?.plan) {
            const choosenPlan = Config.bot_hosting.price_list.find(v => v.code === bot.plan)
            if (choosenPlan && newSettings.owners && Array.isArray(newSettings.owners)) {
               if (newSettings.owners.length > (choosenPlan.owner + (bot?.max_owner || 0))) {
                  return res.status(400).json({
                     creator: global.creator,
                     status: false,
                     message: 'You have reached the maximum number of owners for this plan'
                  })
               }
            }
         }

         if (newSettings.chatbot_config && typeof newSettings.chatbot_config === 'object') {
            const cfg = newSettings.chatbot_config

            if (cfg.instruction !== undefined) {
               setting.chatbot_config.instruction = cfg.instruction
            }

            if (cfg.apikey && typeof cfg.apikey === 'object') {
               setting.chatbot_config.apikey = {
                  ...setting.chatbot_config.apikey,
                  ...cfg.apikey
               }
            }

            if (cfg.model && typeof cfg.model === 'object') {
               setting.chatbot_config.model = {
                  ...setting.chatbot_config.model,
                  ...cfg.model
               }
            }

            delete newSettings.chatbot_config
         }

         if (typeof newSettings.chatbot === 'boolean') {
            if (newSettings.chatbot === true) {
               const config = setting.chatbot_config

               if (!config.instruction || config.instruction.trim() === '') {
                  return res.status(400).json({
                     creator: global.creator,
                     status: false,
                     message: 'Cannot activate Chatbot: System Instruction is required.'
                  })
               }

               const isGroqReady = config.apikey?.groq && config.model?.groq
               const isGeminiReady = config.apikey?.gemini && config.model?.gemini
               const isCloudflareReady = config.apikey?.cloudflare?.account && config.apikey?.cloudflare?.token && config.model?.cloudflare?.image && config.model?.cloudflare?.text

               if (!isGroqReady || !isGeminiReady || !isCloudflareReady) {
                  return res.status(400).json({
                     creator: global.creator,
                     status: false,
                     message: 'Cannot activate Chatbot: Groq, Gemini & Cloudflare must be fully configured (API Key & Model).'
                  })
               }
            }

            setting.chatbot = newSettings.chatbot
            delete newSettings.chatbot
         }

         for (const key in newSettings) {
            if (!Object.prototype.hasOwnProperty.call(setting, key)) continue
         
            if (bot?.plan && Config.bot_hosting.price_list
               .find(v => v.code === bot?.plan)) {
               const choosenPlan = Config.bot_hosting.price_list
                  .find(v => v.code === bot.plan)

               const lockedKeys = Config.bot_hosting.locked_customize
               const oldValue = setting[key]
               const newValue = newSettings[key]

               const isChanged =
                  typeof newValue === 'object'
                     ? JSON.stringify(oldValue) !== JSON.stringify(newValue)
                     : oldValue !== newValue

               if (
                  !choosenPlan.customize &&
                  lockedKeys.map(v => v.key).includes(key) &&
                  isChanged
               ) {
                  return res.status(400).json({
                     creator: global.creator,
                     status: false,
                     message: `You are not allowed to change "${lockedKeys.find(v => v.key === key).name}". Upgrade your plan to customize your bot.`
                  })
               }
            }

            setting[key] = newSettings[key]
         }

         res.json({
            creator: global.creator,
            status: true,
            message: 'Settings updated successfully'
         })
      } catch (e) {
         Utils.printError(e)
         res.status(500).json({
            creator: global.creator,
            status: false,
            message: e.message
         })
      }
   },
   error: false,
   login: true
}