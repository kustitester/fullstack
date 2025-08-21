const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

// Middleware for CORS
app.use(cors())
// Middleware for logging
morgan.token('body', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

require('dotenv').config()
const mongoose = require('mongoose')
const Person = require('./models/person')

// MongoDB connection
const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.set('strictQuery', false)
mongoose.connect(url)

// Middleware to parse JSON
app.use(express.json())

// Serve static files from the React app
app.use(express.static('dist'))

// GET endpoint for phone directory
app.get('/api/persons', async (request, response, next) => {
  try {
    const persons = await Person.find({})
    response.json(persons)
  } catch (error) {
    next(error)
  }
})

// POST endpoint to add new person
app.post('/api/persons', async (request, response, next) => {
  try {
    const body = request.body

    if (!body.name || !body.number) {
      return response.status(400).json({
        error: 'name or number missing'
      })
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    })

    const savedPerson = await person.save()
    response.json(savedPerson)
  } catch (error) {
    next(error)
  }
})

// GET endpoint for individual person by ID
app.get('/api/persons/:id', async (request, response, next) => {
  try {
    const person = await Person.findById(request.params.id)
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

// PUT endpoint for updating individual person by ID
app.put('/api/persons/:id', async (request, response, next) => {
  try {
    const body = request.body
    const id = request.params.id

    console.log('PUT request - ID:', id, 'Body:', body)

    if (!body.name || !body.number) {
      return response.status(400).json({
        error: 'name or number missing'
      })
    }

    if (!id || id === 'undefined') {
      return response.status(400).json({
        error: 'invalid id provided'
      })
    }

    const updatedPerson = await Person.findByIdAndUpdate(
      id,
      { name: body.name, number: body.number },
      { new: true }
    )

    if (updatedPerson) {
      response.json(updatedPerson)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

// DELETE endpoint for individual person by ID
app.delete('/api/persons/:id', async (request, response, next) => {
  try {
    const result = await Person.findByIdAndDelete(request.params.id)
    if (result) {
      response.status(204).end()
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

// Info endpoint
app.get('/info', async (request, response, next) => {
  try {
    const count = await Person.countDocuments({})
    const currentTime = new Date().toString()
    response.send(`
      <div>
        <p>Phonebook has info for ${count} people</p>
        <p>${currentTime}</p>
      </div>
    `)
  } catch (error) {
    next(error)
  }
})

// Root endpoint
app.get('/', (response) => {
  response.send('<h1>Phone Directory Backend</h1>')
})

// Error handling middleware
app.use((error, response) => {
  console.error('Error details:', {
    name: error.name,
    message: error.message,
    value: error.value,
    path: error.path
  })

  if (error.name === 'CastError') {
    return response.status(400).json({
      error: 'malformatted id',
      details: `Invalid ID: ${error.value}`
    })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  response.status(500).json({ error: 'internal server error' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})