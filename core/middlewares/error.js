export default (req, res) => {
   res.json({
      creator: global.creator,
      status: false,
      msg: 'Sorry, this feature is currently error and will be fixed soon'
   })
}