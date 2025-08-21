const express = require('express')
const { requestLogger, unknownEndpoint, errorHandler, tokenExtractor, userExtractor } = require('./utils/middleware')
const { getAllBlogs, createBlog, deleteBlog, updateBlog } = require('./controllers/blogs')
const { getAllUsers, createUser } = require('./controllers/users')
const { login } = require('./controllers/auth')

const app = express()

app.use(express.json())
app.use(requestLogger)
app.use(tokenExtractor)

app.post('/api/login', login)

app.get('/api/blogs', getAllBlogs)
app.post('/api/blogs', userExtractor, createBlog)
app.put('/api/blogs/:id', userExtractor, updateBlog)
app.delete('/api/blogs/:id', userExtractor, deleteBlog)

app.get('/api/users', getAllUsers)
app.post('/api/users', createUser)

// Test route for error handling
app.get('/api/blogs/:id', (request, response, next) => {
  const id = request.params.id
  if (id === 'invalid') {
    const error = new Error('Invalid ID format')
    error.name = 'CastError'
    next(error)
  } else {
    response.json({ message: 'Valid ID', id })
  }
})

// Testing router - only available in test mode
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app 