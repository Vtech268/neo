import { Version } from '@neoxr/wb'
import fs from 'node:fs'

export const run = {
   usage: ['menu', 'help', 'command', 'allmenu'],
   async: async (m, {
      client, text, isPrefix, command, setting, plugins, Config, Utils, system
   }) => {
      try {
         const local_size = fs.existsSync('./' + Config.database + '.json') ? await Utils.formatSize(fs.statSync('./' + Config.database + '.json').size) : ''
         const library = JSON.parse(fs.readFileSync('./node_modules/baileys/package.json', 'utf-8'))
         let message = setting.msg
            .replace('+tag', `@${m.sender.replace(/@.+/g, '')}`)
            .replace('+name', m.pushName).replace('+greeting', Utils.greeting())
            .replace('+db', (system.name === 'Local' ? `Local (${local_size})` : system.name))
            .replace('+module', Version)
            .replace('+version', library.version)

         const style = setting.style

         let filter = Object.entries(plugins).filter(([_, obj]) => obj.run.usage)
         let cmdObj = Object.fromEntries(filter)
         let category = {}

         for (let name in cmdObj) {
            let obj = cmdObj[name].run
            if (!obj || !obj.category || setting.hidden.includes(obj.category)) continue
            if (!category[obj.category]) category[obj.category] = []
            category[obj.category].push(obj)
         }
         const keys = Object.keys(category).sort()

         const getFormattedCommands = (catName) => {
            let cmdList = Object.entries(plugins).filter(([_, v]) => v.run.usage && v.run.category == catName.toLowerCase() && !setting.hidden.includes(v.run.category.toLowerCase()))
            let commands = []
            cmdList.map(([_, v]) => {
               let usageType = v.run.usage.constructor.name
               if (usageType === 'Array') {
                  v.run.usage.map(x => commands.push({ usage: x, use: v.run.use ? Utils.texted('bold', v.run.use) : '' }))
               } else if (usageType === 'String') {
                  commands.push({ usage: v.run.usage, use: v.run.use ? Utils.texted('bold', v.run.use) : '' })
               }
            })
            return commands.sort((a, b) => a.usage.localeCompare(b.usage))
         }

         const formatPrefixList = (commandsList) => {
            if (commandsList.length === 0) return ''
            return commandsList.map((v, i) => {
               if (i == 0) return `┌  ◦  ${isPrefix + v.usage} ${v.use}`
               if (i == commandsList.length - 1) return `└  ◦  ${isPrefix + v.usage} ${v.use}`
               return `│  ◦  ${isPrefix + v.usage} ${v.use}`
            }).join('\n')
         }

         const buildSections = () => {
            let sections = []
            const label = { highlight_label: 'Many Used' }
            keys.sort((a, b) => a.localeCompare(b)).map((v) => sections.push({
               ...(/download|conver|util/.test(v) ? label : {}),
               rows: [{
                  title: Utils.ucword(v),
                  description: `There are ${getFormattedCommands(v).length} commands`,
                  id: `${isPrefix + command} ${v}`
               }]
            }))
            return sections
         }

         let print = message + '\n' + String.fromCharCode(8206).repeat(4001)

         if (command === 'allmenu') {
            for (let k of keys) {
               print += '\n\n乂  *' + k.toUpperCase().split('').join(' ') + '*\n\n'
               let commands = getFormattedCommands(k)
               if (commands.length == 0) continue
               print += commands.map(v => `	◦  ${isPrefix + v.usage} ${v.use}`).join('\n')
            }
            return client.sendMessageModify(m.chat, Utils.Styles(print) + '\n\n' + global.footer, m, {
               largeThumb: true,
               type: 'preview-link',
               /* choose: landscape (default), potrait, square */
               ratio: 'landscape',
               thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
               url: setting.link,
               icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
            })
         }

         switch (style) {
            case 1:
            case 2:
            case 3:
               for (let k of keys) {
                  let divider = style === 1 ? '乂' : '–'
                  print += `\n\n ${divider}  *` + k.toUpperCase().split('').join(' ') + '*\n\n'
                  let commands = getFormattedCommands(k)
                  if (commands.length == 0) continue
                  print += style === 1 ? commands.map(v => `	◦  ${isPrefix + v.usage} ${v.use}`).join('\n') : formatPrefixList(commands)
               }
               let formattedPrintStyle123 = style === 3 ? print : Utils.Styles(print)
               client.sendMessageModify(m.chat, formattedPrintStyle123 + '\n\n' + global.footer, m, {
                  largeThumb: true,
                  type: 'preview-link',
                  /* choose: landscape (default), potrait, square */
                  ratio: 'landscape',
                  thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
                  url: setting.link,
                  icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
               })
               break

            case 4:
            case 5:
               if (text) {
                  let commands = getFormattedCommands(text.trim())
                  if (commands.length === 0) return
                  let out = formatPrefixList(commands)
                  m.reply(style === 6 ? Utils.Styles(out) : out)
               } else {
                  print += '\n'
                  let out = formatPrefixList(keys.map(k => ({ usage: command, use: k })))
                  let formattedPrint = style === 6 ? Utils.Styles(print + out) : (print + out)
                  client.sendMessageModify(m.chat, formattedPrint + '\n\n' + global.footer, m, {
                     largeThumb: true,
                     type: 'preview-link',
                     /* choose: landscape (default), potrait, square */
                     ratio: 'landscape',
                     thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
                     url: setting.link,
                     icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
                  })
               }
               break

            case 6:
               if (text) {
                  let commands = getFormattedCommands(text.trim())
                  if (commands.length === 0) return
                  m.reply(Utils.Styles(formatPrefixList(commands)))
               } else {
                  const buttonsV7 = [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: 'Tap Here!', sections: buildSections() }) }]
                  client.sendIAMessage(m.chat, buttonsV7, m, {
                     header: global.header, content: message, v2: true, footer: global.footer, media: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64')
                  })
               }
               break

            case 7:
               if (text) {
                  let commands = getFormattedCommands(text.trim())
                  if (commands.length === 0) return
                  m.reply(Utils.Styles(formatPrefixList(commands)))
               } else {
                  const buttonsV8 = [
                     { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'Wapify - WhatsApp Gateway', url: 'https://wapify.neoxr.eu', merchant_url: 'https://wapify.neoxr.eu' }) },
                     { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'Neoxr API', url: 'https://api.neoxr.eu', merchant_url: 'https://api.neoxr.eu' }) },
                     { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'Temporary Uploader', url: 'https://s.neoxr.eu', merchant_url: 'https://s.neoxr.eu' }) },
                     { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'Neoxr Official Store', url: 'https://shop.neoxr.eu', merchant_url: 'https://shop.neoxr.eu' }) },
                     { name: 'single_select', buttonParamsJson: JSON.stringify({ title: 'Next Page', sections: buildSections() }) }
                  ]
                  client.sendIAMessage(m.chat, buttonsV8, m, {
                     header: global.header, content: message, v2: true, footer: global.footer, media: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'), multiple: { name: 'オートメーション', code: 'Neoxr Creative', list_title: 'Select Menu', button_title: 'Tap Here!' }
                  })
               }
               break
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}