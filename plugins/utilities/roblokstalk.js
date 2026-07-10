import { USD } from '../../lib/games/rpg-utils.js'

export const run = {
    usage: ['robloxstalk'],
    hidden: ['rs'],
    use: 'username',
    category: 'utilities',
    async: async (m, {
        client,
        args,
        isPrefix,
        command,
        Utils
    }) => {
        try {
            if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'roblox'), m)
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/roblox-stalk', {
                username: args[0]
            })
            if (!json.status) return client.reply(m.chat, Utils.texted('bold', `🚩 Account not found.`), m)
            let caption = `乂  *R O B L O X - S T A L K*\n\n`
            caption += `	◦  *Name* : ${json.data.displayName}\n`
            caption += `	◦  *Username* : ${json.data.name}\n`
            caption += `	◦  *Friends* : ${Utils.formatter(json.data.friends)}\n`
            caption += `	◦  *Followers* : ${Utils.formatter(json.data.followers)}\n`
            caption += `	◦  *Followings* : ${Utils.formatter(json.data.followings)}\n`
            caption += `	◦  *Bio* : ${json.data.description}\n`
            caption += `	◦  *Banned* : ${Utils.switcher(json.data.isBanned, '√', '×')}\n\n`

            if (json.data.games.length) {
                caption += `乂  *G A M E S*\n\n`
                for (let game of json.data.games) {
                    caption += `\t◦  *Name* : ${game.name}\n`
                    caption += `\t◦  *ID* : ${game.id}\n`
                    caption += `\t◦  *Description* : ${game.description}\n`
                    caption += `\t◦  *Visits* : ${Utils.formatter(game.placeVisits)}x\n\n`
                }
            }

            if (json.data.inventory.length) {
                caption += `乂  *I N V E N T O R Y*\n\n`
                for (let inv of json.data.inventory) {
                    caption += `\t⌗  *${inv.name}*\n`
                    caption += `\t◦  *Price* : ${USD.format(inv.originalPrice)}\n`
                    caption += `\t◦  *Averange Price* : ${USD.format(inv.recentAveragePrice)}\n`
                    caption += `\t◦  *On Hold* : ${Utils.switcher(inv.isOnHold, '√', '×')}\n`
                    caption += `\t◦  *Stock* : ${Utils.formatter(inv.assetStock)}\n\n`
                }
            }
            caption += global.footer
            client.sendFile(m.chat, json.data.avatar, 'image.png', caption, m)
        } catch (e) {
            return client.reply(m.chat, Utils.jsonFormat(e), m)
        }
    },
    error: false,
    limit: true
}