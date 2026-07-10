export const BOT_TYPE = [{
   id: 'original',
   name: 'Full Features',
   plugsdir: null
}, {
   id: 'games',
   name: 'Games Only',
   plugsdir: [
      'plugins/menu.js',
      'plugins/games',
      'plugins/_events/games',
      'plugins/rpg',
      'plugins/userinfo',
      'plugins/misc',
      'plugins/connect'
   ]
}]