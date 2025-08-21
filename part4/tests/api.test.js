const { test, after, beforeEach, before } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const { MONGODB_URI } = require('../utils/config')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

before(async () => {
  await mongoose.connect(MONGODB_URI)
})

const initialBlogs = [
  {
    title: 'HTML is easy',
    author: 'Test Author 1',
    url: 'http://test1.com',
    likes: 5
  },
  {
    title: 'Browser can execute only JavaScript',
    author: 'Test Author 2',
    url: 'http://test2.com',
    likes: 10
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  
  // Create a test user with hashed password
  const passwordHash = await bcrypt.hash('password123', 10)
  const testUser = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash: passwordHash
  })
  await testUser.save()
  
  // Create blogs with user reference
  let blogObject = new Blog({ ...initialBlogs[0], user: testUser._id })
  await blogObject.save()
  blogObject = new Blog({ ...initialBlogs[1], user: testUser._id })
  await blogObject.save()
  
  // Add blogs to user's blogs array
  const blogs = await Blog.find({})
  testUser.blogs = blogs.map(blog => blog._id)
  await testUser.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')
  const titles = response.body.map(e => e.title)
  assert.strictEqual(titles.includes('HTML is easy'), true)
})

test('blogs have id field', async () => {
  const response = await api.get('/api/blogs')
  const blogInResponse = response.body[0]
  assert.strictEqual(typeof blogInResponse.id, 'string')
  assert.strictEqual(blogInResponse._id, undefined)
})

test('blogs contain user information', async () => {
  const response = await api.get('/api/blogs')
  const blogInResponse = response.body[0]
  
  assert.ok(blogInResponse.user)
  assert.strictEqual(blogInResponse.user.username, 'testuser')
  assert.strictEqual(blogInResponse.user.name, 'Test User')
})

test('users contain blog information', async () => {
  const response = await api.get('/api/users')
  const userInResponse = response.body[0]
  
  assert.ok(userInResponse.blogs)
  assert.strictEqual(userInResponse.blogs.length, 2)
  assert.ok(userInResponse.blogs[0].title)
  assert.ok(userInResponse.blogs[0].author)
})

test('a valid blog can be added', async () => {
  // First login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  const token = loginResponse.body.token

  const newBlog = {
    title: 'Async/Await test blog',
    author: 'Async Author',
    url: 'http://asyncblog.com',
    likes: 7
  }

  // Add new blog with token
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  // Fetch all blogs
  const response = await api.get('/api/blogs')
  const titles = response.body.map(b => b.title)

  // Check count and content
  assert.strictEqual(response.body.length, initialBlogs.length + 1)
  assert.ok(titles.includes('Async/Await test blog'))
})

test('blog without likes field defaults to 0 likes', async () => {
  // First login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  const token = loginResponse.body.token

  const newBlog = {
    title: 'Blog without likes',
    author: 'No Likes Author',
    url: 'http://nolikes.com'
  }

  // Add new blog without likes field
  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  // Check that likes defaults to 0
  assert.strictEqual(response.body.likes, 0)
})

test('blog without title returns 400 Bad Request', async () => {
  // First login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  const token = loginResponse.body.token

  const newBlog = {
    author: 'No Title Author',
    url: 'http://notitle.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
})

test('blog without url returns 400 Bad Request', async () => {
  // First login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  const token = loginResponse.body.token

  const newBlog = {
    title: 'Blog without URL',
    author: 'No URL Author',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
})



test('deleting non-existent blog returns 404', async () => {
  // First login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  const token = loginResponse.body.token

  const nonExistentId = '507f1f77bcf86cd799439011' // Valid MongoDB ObjectId format
  
  await api
    .delete(`/api/blogs/${nonExistentId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
})

test('deleting with invalid id returns 400', async () => {
  // First login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  const token = loginResponse.body.token

  const invalidId = 'invalid-id'
  
  await api
    .delete(`/api/blogs/${invalidId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(400)
})

test('blog likes can be updated', async () => {
  // First login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  const token = loginResponse.body.token

  // Get initial blogs
  const initialResponse = await api.get('/api/blogs')
  const blogToUpdate = initialResponse.body[0]
  const newLikes = blogToUpdate.likes + 1

  // Update the blog
  const updateResponse = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ likes: newLikes })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  // Verify the update
  assert.strictEqual(updateResponse.body.likes, newLikes)
  assert.strictEqual(updateResponse.body.title, blogToUpdate.title) // Other fields unchanged
})

test('blog title can be updated', async () => {
  // First login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  const token = loginResponse.body.token

  // Get initial blogs
  const initialResponse = await api.get('/api/blogs')
  const blogToUpdate = initialResponse.body[0]
  const newTitle = 'Updated Title'

  // Update the blog
  const updateResponse = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: newTitle })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  // Verify the update
  assert.strictEqual(updateResponse.body.title, newTitle)
  assert.strictEqual(updateResponse.body.likes, blogToUpdate.likes) // Other fields unchanged
})

test('updating non-existent blog returns 404', async () => {
  // First login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  const token = loginResponse.body.token

  const nonExistentId = '507f1f77bcf86cd799439011'
  
  await api
    .put(`/api/blogs/${nonExistentId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ likes: 10 })
    .expect(404)
})

test('updating with invalid id returns 400', async () => {
  // First login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  const token = loginResponse.body.token

  const invalidId = 'invalid-id'
  
  await api
    .put(`/api/blogs/${invalidId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ likes: 10 })
    .expect(400)
})

test('users are returned as json', async () => {
  await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('a valid user can be added', async () => {
  const newUser = {
    username: 'newuser',
    name: 'New User',
    password: 'password123'
  }

  const response = await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.username, newUser.username)
  assert.strictEqual(response.body.name, newUser.name)
  assert.ok(!response.body.passwordHash) // passwordHash should not be returned
})

test('duplicate username returns 400', async () => {
  const newUser = {
    username: 'duplicateuser',
    name: 'Duplicate User',
    password: 'password123'
  }

  // Create first user
  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)

  // Try to create second user with same username
  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
})

test('user without username returns 400', async () => {
  const newUser = {
    name: 'No Username User',
    password: 'password123'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
})

test('user with short username returns 400', async () => {
  const newUser = {
    username: 'ab',
    name: 'Short Username User',
    password: 'password123'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
})

test('user without password returns 400', async () => {
  const newUser = {
    username: 'testuser',
    name: 'Test User'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
})

test('user with short password returns 400', async () => {
  const newUser = {
    username: 'testuser',
    name: 'Test User',
    password: 'ab'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
})

test('user with both short username and password returns 400', async () => {
  const newUser = {
    username: 'ab',
    name: 'Short Both User',
    password: 'cd'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
})

test('user with missing username and password returns 400', async () => {
  const newUser = {
    name: 'Missing Both User'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
})

test('login with valid credentials returns token', async () => {
  const loginData = {
    username: 'testuser',
    password: 'password123'
  }

  const response = await api
    .post('/api/login')
    .send(loginData)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.ok(response.body.token)
  assert.strictEqual(response.body.username, loginData.username)
  assert.strictEqual(response.body.name, 'Test User')
})

test('login with invalid password returns 401', async () => {
  const loginData = {
    username: 'testuser',
    password: 'wrongpassword'
  }

  await api
    .post('/api/login')
    .send(loginData)
    .expect(401)
})

test('login with non-existent username returns 401', async () => {
  const loginData = {
    username: 'nonexistent',
    password: 'password123'
  }

  await api
    .post('/api/login')
    .send(loginData)
    .expect(401)
})

test('creating blog without token returns 401', async () => {
  const newBlog = {
    title: 'Unauthorized Blog',
    author: 'Unauthorized Author',
    url: 'http://unauthorized.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})

test('creating blog with valid token succeeds', async () => {
  // First login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  const token = loginResponse.body.token

  const newBlog = {
    title: 'Authorized Blog',
    author: 'Authorized Author',
    url: 'http://authorized.com',
    likes: 10
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.title, newBlog.title)
  assert.ok(response.body.user)
  assert.strictEqual(response.body.user.username, 'testuser')
})

test('deleting blog without token returns 401', async () => {
  // Get initial blogs
  const initialResponse = await api.get('/api/blogs')
  const blogToDelete = initialResponse.body[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(401)
})

test('deleting blog with wrong user token returns 403', async () => {
  // First create a new user
  const newUser = {
    username: 'wronguser',
    name: 'Wrong User',
    password: 'password123'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)

  // Login with wrong user
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'wronguser',
      password: 'password123'
    })

  const wrongUserToken = loginResponse.body.token

  // Get initial blogs (created by testuser)
  const initialResponse = await api.get('/api/blogs')
  const blogToDelete = initialResponse.body[0]

  // Try to delete blog with wrong user token
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${wrongUserToken}`)
    .expect(403)
})

test('deleting blog with correct user token succeeds', async () => {
  // First login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  const token = loginResponse.body.token

  // Get initial blogs
  const initialResponse = await api.get('/api/blogs')
  const initialBlogs = initialResponse.body
  const blogToDelete = initialBlogs[0]

  // Delete the blog with correct user token
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  // Verify blog is deleted
  const responseAfterDelete = await api.get('/api/blogs')
  assert.strictEqual(responseAfterDelete.body.length, initialBlogs.length - 1)
  
  const titles = responseAfterDelete.body.map(b => b.title)
  assert.ok(!titles.includes(blogToDelete.title))
})

after(async () => {
  await mongoose.connection.close()
}) 