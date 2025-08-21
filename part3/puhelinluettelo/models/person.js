const mongoose = require('mongoose')

// Custom validator for phone number format
const phoneNumberValidator = function(value) {
  if (!value) return true // Allow empty values if not required

  // Check if it's at least 8 characters long
  if (value.length < 8) {
    return false
  }

  // Check if it contains exactly one hyphen
  const parts = value.split('-')
  if (parts.length !== 2) {
    return false
  }

  // Check if both parts contain only digits
  const firstPart = parts[0]
  const secondPart = parts[1]

  if (!/^\d+$/.test(firstPart) || !/^\d+$/.test(secondPart)) {
    return false
  }

  // Check if first part has 2 or 3 digits
  if (firstPart.length < 2 || firstPart.length > 3) {
    return false
  }

  return true
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: phoneNumberValidator,
      message: props => `${props.value} is not a valid phone number. Format should be XX-XXXXXXX or XXX-XXXXXXX`
    }
  }
})

module.exports = mongoose.model('Person', personSchema, 'persons') 