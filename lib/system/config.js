import { NeoxrApi, Utils } from '@neoxr/wb'

global.Api = new NeoxrApi('https://api.neoxr.my.id/api', process.env.API_KEY)

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

global.header = `© neoxr-bot v${require('../../package.json').version}`
global.footer = `ʟɪɢʜᴛᴡᴇɪɢʜᴛ ᴡᴀʙᴏᴛ ᴍᴀᴅᴇ ʙʏ danquere ッ`

global.status = Object.freeze({
   process: Utils.Styles('Please wait . . .'),
   invalid: Utils.Styles('Invalid url'),
   wrong: Utils.Styles('Wrong format.'),
   fail: Utils.Styles('Can\'t get metadata'),
   error: Utils.Styles('Error occurred'),
   errorF: Utils.Styles('Sorry this feature is in error.'),
   premium: Utils.Styles('This feature only for premium user.'),
   operator: Utils.Styles('This command only for operator.'),
   owner: Utils.Styles('This command only for owner.'),
   moderator: Utils.Styles('This command only for owner & moderator.'),
   group: Utils.Styles('This command will only work in groups.'),
   botAdmin: Utils.Styles('This command will work when I become an admin.'),
   admin: Utils.Styles('This command only for group admin.'),
   private: Utils.Styles('Use this command in private chat.'),
   gameSystem: Utils.Styles('Game features have been disabled.'),
   gameInGroup: Utils.Styles('Game features have not been activated for this group.'),
   gameLevel: Utils.Styles('You cannot play the game because your level has reached the maximum limit.'),
   upgrade: Utils.Styles('Uprade your plan to use this feature.')
})

export const allowedIPs = []
