const Blog = require('../models/blog')
const User = require('../models/user')

const getAllBlogs = async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
}

const createBlog = async (request, response) => {
  const { title, url } = request.body

  if (!title || !url) {
    return response.status(400).json({ error: 'title and url are required' })
  }

  // Use the authenticated user from request.user
  const user = request.user

  const blog = new Blog({
    ...request.body,
    user: user._id
  })

  const result = await blog.save()
  
  // Add blog to user's blogs array using atomic operation
  await User.findByIdAndUpdate(
    user._id,
    { $push: { blogs: result._id } }
  )

  // Populate user info before sending response
  const populatedBlog = await Blog.findById(result._id).populate('user', { username: 1, name: 1 })
  
  response.status(201).json(populatedBlog)
}

const updateBlog = async (request, response) => {
  const { id } = request.params
  const { title, author, url, likes } = request.body

  try {
    const blog = await Blog.findById(id)
    
    if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    // Update fields if provided
    if (title !== undefined) blog.title = title
    if (author !== undefined) blog.author = author
    if (url !== undefined) blog.url = url
    if (likes !== undefined) blog.likes = likes

    const updatedBlog = await blog.save()
    const populatedBlog = await Blog.findById(updatedBlog._id).populate('user', { username: 1, name: 1 })
    response.json(populatedBlog)
  } catch (error) {
    if (error.name === 'CastError') {
      return response.status(400).json({ error: 'malformatted id' })
    }
    response.status(500).json({ error: 'internal server error' })
  }
}

const deleteBlog = async (request, response) => {
  const { id } = request.params
  const user = request.user
  
  try {
    const blog = await Blog.findById(id)
    
    if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    // Check if the user is the creator of the blog
    if (blog.user.toString() !== user._id.toString()) {
      return response.status(403).json({ error: 'only the creator can delete this blog' })
    }

    await Blog.findByIdAndDelete(id)
    response.status(204).end()
  } catch (error) {
    if (error.name === 'CastError') {
      return response.status(400).json({ error: 'malformatted id' })
    }
    response.status(500).json({ error: 'internal server error' })
  }
}

module.exports = {
  getAllBlogs,
  createBlog,
  deleteBlog,
  updateBlog
} 