const bcrypt = require('bcrypt')
const User = require('../models/user')

const getAllUsers = async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  response.json(users)
}

const createUser = async (request, response) => {
  const { username, name, password } = request.body

  // Validate username
  if (!username) {
    return response.status(400).json({ 
      error: 'username is required' 
    })
  }

  if (username.length < 3) {
    return response.status(400).json({ 
      error: 'username must be at least 3 characters long' 
    })
  }

  // Validate password
  if (!password) {
    return response.status(400).json({ 
      error: 'password is required' 
    })
  }

  if (password.length < 3) {
    return response.status(400).json({ 
      error: 'password must be at least 3 characters long' 
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    if (error.code === 11000) {
      return response.status(400).json({ 
        error: 'username must be unique' 
      })
    }
    response.status(400).json({ error: error.message })
  }
}

module.exports = {
  getAllUsers,
  createUser
} 