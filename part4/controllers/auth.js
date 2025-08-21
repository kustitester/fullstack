const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const { JWT_SECRET } = require('../utils/config')

const login = async (request, response) => {
  const { username, password } = request.body

  if (!username || !password) {
    return response.status(400).json({ 
      error: 'username and password are required' 
    })
  }

  const user = await User.findOne({ username })

  if (!user) {
    return response.status(401).json({ 
      error: 'invalid username or password' 
    })
  }

  const passwordCorrect = await bcrypt.compare(password, user.passwordHash)

  if (!passwordCorrect) {
    return response.status(401).json({ 
      error: 'invalid username or password' 
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, JWT_SECRET, { expiresIn: 60*60 })

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
}

module.exports = {
  login
} 