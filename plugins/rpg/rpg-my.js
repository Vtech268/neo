import fs from 'node:fs'
import { USD, playerLvl } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['my'],
   category: 'rpg',
   async: async (m, {
      client,
      players,
      users,
      setting,
      Utils
   }) => {
      try {
         const avatar = await client.profilePicture(m.sender)
         const clan = global.db?.clans?.find(v => v.leader === m.sender) || global.db?.clans?.find(v => v.request.find(v => v.jid === m.sender && v.state === 'JOINED'))
         let caption = `乂  *P R O F I L E*\n\n`
         caption += `   ◦  *Name* : ${players.name}\n`
         caption += `   ◦  *Pocket* : ${USD.format(users.pocket)}\n`
         caption += `   ◦  *Balance* : ${USD.format(users.balance)}\n`
         caption += `   ◦  *EXP* : ${Utils.formatNumber(players.exp)}\n`
         caption += `   ◦  *Agility* : ${Utils.formatNumber(players.agility)}\n`
         caption += `   ◦  *Defense* : ${Utils.formatNumber(players.defense)}\n`
         caption += `   ◦  *Health* : ${Utils.formatNumber(players.health)}%\n`
         caption += `   ◦  *Lucky* : ${Utils.formatNumber(players.lucky)}\n`
         caption += `   ◦  *Stamina* : ${Utils.formatNumber(players.stamina)}\n`
         caption += `   ◦  *Strength* : ${Utils.formatNumber(players.strength)}\n\n`
         caption += `乂  *S T A T S*\n\n`
         caption += `   ◦  *Clan* : ${clan ? Utils.ucword(clan.name) : 'N/A'}\n`
         caption += `   ◦  *Berserker*\n`
         caption += `       ▦  Lose : ${players.berserker.lose}x\n`
         caption += `       ▦  Winner : ${players.berserker.winner}x\n`
         caption += `   ◦  *Pet Battle*\n`
         caption += `       ▦  Lose : ${players.petbattle.lose}x\n`
         caption += `       ▦  Winner : ${players.petbattle.winner}x\n`
         caption += `   ◦  *Quest* : ${players.quest.length}\n`
         caption += `   ◦  *Level* : ${playerLvl(players.exp)}\n\n`
         caption += global.footer
         client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            type: 'preview-link',
            ratio: 'square',
            thumbnail: avatar,
            icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
         })
      } catch (e) {
         m.reply(Utils.jsonFormat(e))
      }
   },
   error: false,
   group: true,
   game: true
}