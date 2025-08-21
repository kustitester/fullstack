import { useState } from 'react'
import blogService from '../services/blogs'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const returnedBlog = await blogService.create({
        title,
        author,
        url
      })
      createBlog(returnedBlog)
      setTitle('')
      setAuthor('')
      setUrl('')
    } catch (exception) {
      console.log('Failed to create blog')
    }
  }

  return (
    <form onSubmit={handleSubmit} role="form">
      <div>
        <label htmlFor="title">title:</label>
        <input
          id="title"
          type="text"
          value={title}
          name="Title"
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>
      <div>
        <label htmlFor="author">author:</label>
        <input
          id="author"
          type="text"
          value={author}
          name="Author"
          onChange={({ target }) => setAuthor(target.value)}
        />
      </div>
      <div>
        <label htmlFor="url">url:</label>
        <input
          id="url"
          type="text"
          value={url}
          name="Url"
          onChange={({ target }) => setUrl(target.value)}
        />
      </div>
      <button type="submit">create</button>
    </form>
  )
}

export default BlogForm