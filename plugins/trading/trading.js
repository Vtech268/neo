export const run = {
   usage: ['trading'],
   category: 'trading',
   async: async (m, {
      isPrefix,
   }) => {
      m.reply(explain(isPrefix))
   },
   error: false
}

const explain = prefix => {
   return `乂  *T R A D I N G*

Fitur ini hanya simulasi dengan sistem yang didesign hampir mirip seperti trading sungguhan dan cocok untuk belajar trading tanpa resiko, berikut adalah penjelasan dari istilah dan perintah yang digunakan :

〄 Market Trend / Market Sentiment
   ◦ Bullish (▲) : Harga sedang/cenderung Naik
   ◦ Bearish (▼) : Harga sedang/cenderung Turun
   ◦ Sideway (⥦) : Harga stabil

〄 Global Market Snapshot
   ◦ Kondisi pasar untuk periode tertentu.
   ◦ Command : ${prefix}market

〄 Spot Market Action
   ◦ Spot Buy : Membeli aset tanpa leverage dan aset langsung dimiliki
   ◦ Spot Sell : Menjual aset spot yang dimiliki
   ◦ Command : ${prefix}spotbuy / ${prefix}spotsell

〄 Derivatives / Margin Position
   ◦ Long : Membuka posisi untung jika harga naik
   ◦ Short : Membuka posisi untung jika harga turun
   ◦ Command : ${prefix}long / ${prefix}short

〄 Position Management
   ◦ Menutup posisi (long/short), merealisasikan PnL.
   ◦ Command : ${prefix}exit

〄 Yield / Passive Income Mechanism
   ◦ Mengunci aset yang dimiliki untuk mendapatkan reward.
   ◦ Command : ${prefix}stake / ${prefix}mystake

〄 TP (Target Profit) & SL (Stop Loss)
   ◦ TP digunakan untuk mengamankan profit tanpa harus memantau harga terus-menerus.
   ◦ SL digunakan untuk membatasi kerugian agar tidak semakin besar.
   ◦ Command : ${prefix}order / ${prefix}myorder / ${prefix}cancelorder

〄 LB (Limit Buy) & LS (Limit Sell)
   ◦ LB digunakan sebagai trigger batas harga pembelian yang sudah ditentukan.
   ◦ LS digunakan sebagai trigger batas harga jual yang sudah ditentukan.

〄 Liquidate
   ◦ Penutupan posisi secara paksa oleh sistem karena modal (margin) tidak lagi cukup untuk menahan kerugian.

〄 Trading Signal
   ◦ Indikasi atau rekomendasi aksi trading yang dihasilkan dari analisis data pasar.
   ◦ Command : ${prefix}signal

〄 Top Trader
   ◦ 10 daftar trader terbaik/kaya berdasarkan Net Worth.
   ◦ Command : ${prefix}toptrader

〄 Portfolio
   ◦ Ringkasan seluruh aset yang dimiliki.
   ◦ Command : ${prefix}portfolio / ${prefix}pf

${global.footer}`
}