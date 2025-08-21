const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('./config')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  }
  next()
}

const userExtractor = async (request, response, next) => {
  if (!request.token) {
    return response.status(401).json({ error: 'token missing' })
  }

  try {
    const decodedToken = jwt.verify(request.token, JWT_SECRET)
    const user = await User.findById(decodedToken.id)
    
    if (!user) {
      return response.status(401).json({ error: 'user not found' })
    }
    
    request.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return response.status(401).json({ error: 'invalid token' })
    } else if (error.name === 'TokenExpiredError') {
      return response.status(401).json({ error: 'token expired' })
    }
    next(error)
  }
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
} 