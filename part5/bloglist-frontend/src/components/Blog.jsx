import { useState } from 'react'
import PropTypes from 'prop-types'
import blogService from '../services/blogs'

const Blog = ({ blog, updateBlog, removeBlog, user }) => {
  const [showDetails, setShowDetails] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const handleLike = async () => {
    const updatedBlog = {
      user: blog.user?.id || blog.user,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url
    }

    try {
      const returnedBlog = await blogService.update(blog.id, updatedBlog)
      updateBlog(returnedBlog)
    } catch (exception) {
      console.log('Failed to update blog')
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      try {
        await blogService.remove(blog.id)
        removeBlog(blog.id)
      } catch (exception) {
        console.log('Failed to delete blog')
      }
    }
  }

  // Check if current user is the blog creator
  const isBlogCreator = () => {
    if (!user || !blog.user) return false

    // Try to get user ID from token first
    let currentUserId = null
    try {
      if (user.token) {
        const tokenPayload = JSON.parse(atob(user.token.split('.')[1]))
        currentUserId = tokenPayload.id
      }
    } catch (e) {
      console.log('Failed to parse token')
    }

    // Fallback to username comparison
    if (!currentUserId && user.username && blog.user.username) {
      return user.username === blog.user.username
    }

    // Compare user IDs
    const blogUserId = blog.user.id || blog.user._id || blog.user

    return currentUserId === blogUserId
  }

  const showDeleteButton = isBlogCreator()

  return (
    <div style={blogStyle}>
      <div>
        {blog.title} {blog.author}
        <button onClick={toggleDetails}>
          {showDetails ? 'hide' : 'view'}
        </button>
      </div>
      {showDetails && (
        <div>
          <div>{blog.url}</div>
          <div>likes {blog.likes} <button onClick={handleLike}>like</button></div>
          <div>{blog.user?.name}</div>
          {showDeleteButton && (
            <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>
              delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      username: PropTypes.string
    })
  }).isRequired,
  updateBlog: PropTypes.func.isRequired,
  removeBlog: PropTypes.func.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    name: PropTypes.string,
    token: PropTypes.string
  })
}

export default Blog