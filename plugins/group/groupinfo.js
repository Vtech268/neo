import { format } from 'date-fns'

export const run = {
   usage: ['groupinfo'],
   hidden: ['gcinfo'],
   category: 'group',
   async: async (m, {
      client,
      participants,
      groupSet: setting,
      Utils
   }) => {
      try {
         const meta = await (await client.groupMetadata(m.chat))
         const creator = (meta?.owner?.endsWith('lid') ? (meta?.ownerJid ?? meta?.ownerPn) : meta.owner)?.replace(/@.+/, '')
         const admin = await client.getAdmin(meta.participants)
         const member = participants.map(u => u.id)
         const picture = await client.profilePicture(m.chat)
         let caption = `乂  *G R O U P - I N F O*\n\n`
         caption += `	◦  *Name* : ${meta.subject}\n`
         caption += `	◦  *Type* : ${meta.addressingMode === 'lid' ? 'LID' : 'PN'}\n`
         caption += `	◦  *Member* : ${member.length}\n`
         caption += `	◦  *Admin* : ${admin.length}\n`
         caption += `	◦  *Created* : ${format(meta.creation * 1000, 'dd/MM/yy HH:mm:ss')}\n`
         caption += `	◦  *Owner* : ${creator ? '@' + creator : '-'}\n\n`
         caption += `乂  *M O D E R A T I O N*\n\n`
         caption += `	◦  ${Utils.switcher(setting.adminonly, '[ √ ]', '[ × ]')} Admin Only\n`
         caption += `	◦  ${Utils.switcher(setting.antibot, '[ √ ]', '[ × ]')} Anti Bot\n`
         caption += `	◦  ${Utils.switcher(setting.antidelete, '[ √ ]', '[ × ]')} Anti Delete\n`
         caption += `	◦  ${Utils.switcher(setting.antilink, '[ √ ]', '[ × ]')} Anti Link\n`
         caption += `	◦  ${Utils.switcher(setting.antiporn, '[ √ ]', '[ × ]')} Anti Porn\n`
         caption += `	◦  ${Utils.switcher(setting.antitagsw, '[ √ ]', '[ × ]')} Anti Story Tag\n`
         caption += `	◦  ${Utils.switcher(setting.antivirtex, '[ √ ]', '[ × ]')} Anti Virtex\n`
         caption += `	◦  ${Utils.switcher(setting.antiforward, '[ √ ]', '[ × ]')} Anti Forward\n`
         caption += `	◦  ${Utils.switcher(setting.autosticker, '[ √ ]', '[ × ]')} Auto Sticker\n`
         caption += `	◦  ${Utils.switcher(setting.captcha, '[ √ ]', '[ × ]')} Captcha Verify\n`
         caption += `	◦  ${Utils.switcher(setting.filter, '[ √ ]', '[ × ]')} Filter\n`
         caption += `	◦  ${Utils.switcher(setting.game, '[ √ ]', '[ × ]')} Games\n`
         caption += `	◦  ${Utils.switcher(setting.mysterybox, '[ √ ]', '[ × ]')} Mystery Box\n`
         caption += `	◦  ${Utils.switcher(setting.left, '[ √ ]', '[ × ]')} Left Message\n`
         caption += `	◦  ${Utils.switcher(setting.localonly, '[ √ ]', '[ × ]')} Localonly\n`
         caption += `	◦  ${Utils.switcher(setting.restrict, '[ √ ]', '[ × ]')} Restrict\n`
         caption += `	◦  ${Utils.switcher(setting.welcome, '[ √ ]', '[ × ]')} Welcome Message\n\n`
         caption += `乂  *G R O U P - S T A T U S*\n\n`
         caption += `	◦  *Muted* : ${Utils.switcher(setting.mute, '√', '×')}\n`
         caption += `	◦  *Stay* : ${Utils.switcher(setting.stay, '√', '×')}\n`
         caption += `	◦  *Expired* : ${setting.expired == 0 ? 'NOT SET' : Utils.timeReverse(setting.expired - new Date * 1)}\n\n`
         caption += global.footer
         client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            thumbnail: picture,
            type: 'preview-link',
            ratio: 'square'
         })
      } catch (e) {
         console.log(e)
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   group: true
}