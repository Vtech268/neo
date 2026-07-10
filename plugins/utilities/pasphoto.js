export const run = {
   usage: ['pasfoto'],
   hidden: ['pasphoto', 'pas'],
   use: 'color & reply media',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils,
      Scraper
   }) => {
      try {
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            let type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            let q = m.quoted ? m.quoted.message[type] : m.msg
            let img = await client.downloadMediaMessage(q)
            if (!/image/.test(type)) return client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
            client.sendReact(m.chat, '🕒', m.key)
            const srv = await Scraper.uploadImageV2(img)
            if (!srv.status) return m.reply(Utils.jsonFormat(srv))
            const color = text ? text : (m.quoted && m.quoted.text) ? m.quoted.text : 'red'
            const isColor = colors.find(c => c.name === color)
            if (!isColor) return client.reply(m.chat, Utils.texted('bold', `🚩 Warna tidak tersedia (pilih : ${colors.map(v => v.name).join(', ')}).`), m)
            const json = await Api.neoxr('/ppmaker', {
               image: srv.data.url,
               color: hexToRgb(isColor.value)
            })
            if (!json.status) return m.reply(Utils.jsonFormat(json))
            client.sendFile(m.chat, json.data.url, '', '', m)
         } else {
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
            let img = await q.download()
            if (!img) return client.reply(m.chat, global.status.wrong, m)
            client.sendReact(m.chat, '🕒', m.key)
            const srv = await Scraper.uploadImageV2(img)
            if (!srv.status) return m.reply(Utils.jsonFormat(srv))
            const color = text ? text : (m.quoted && m.quoted.text) ? m.quoted.text : 'red'
            const isColor = colors.find(c => c.name === color)
            if (!isColor) return client.reply(m.chat, Utils.texted('bold', `🚩 Warna tidak tersedia (pilih : ${colors.map(v => v.name).join(', ')}).`), m)
            const json = await Api.neoxr('/ppmaker', {
               image: srv.data.url,
               color: hexToRgb(isColor.value)
            })
            if (!json.status) return m.reply(Utils.jsonFormat(json))
            client.sendFile(m.chat, json.data.url, '', '', m)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}

const hexToRgb = hex => {
   // Remove the hash (#) if present
   hex = hex.replace(/^#/, '')

   // If shorthand notation is used (e.g., #abc), expand it to full form (e.g., #aabbcc)
   if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('')
   }

   // Parse the hex string into red, green, and blue values
   const bigint = parseInt(hex, 16)
   const r = (bigint >> 16) & 255
   const g = (bigint >> 8) & 255
   const b = bigint & 255

   return `rgb(${r}, ${g}, ${b})`
}

const colors = [{
   name: 'red',
   value: '#CC0000'
}, {
   name: 'green',
   value: '#00CC00'
}, {
   name: 'blue',
   value: '#000099'
}, {
   name: 'yellow',
   value: '#CCCC00'
}, {
   name: 'purple',
   value: '#990099'
}, {
   name: 'pink',
   value: '#FF00FF'
}, {
   name: 'orange',
   value: '#FF9900'
}, {
   name: 'black',
   value: '#000000'
}, {
   name: 'white',
   value: '#FFFFFF'
}, {
   name: 'gray',
   value: '#808080'
}, {
   name: 'brown',
   value: '#996633'
}]