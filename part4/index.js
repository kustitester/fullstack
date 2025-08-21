const mongoose = require('mongoose')
const { MONGODB_URI, PORT } = require('./utils/config')
const { info } = require('./utils/logger')
const app = require('./app')

mongoose.connect(MONGODB_URI)

app.listen(PORT, () => {
  info(`Server running on port ${PORT}`)
}) 