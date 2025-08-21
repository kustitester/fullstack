const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null
  return blogs.reduce((fav, blog) => (blog.likes > fav.likes ? blog : fav), blogs[0])
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null
  const counts = {}
  blogs.forEach(blog => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
  })
  let maxAuthor = null
  let maxBlogs = 0
  for (const author in counts) {
    if (counts[author] > maxBlogs) {
      maxAuthor = author
      maxBlogs = counts[author]
    }
  }
  return { author: maxAuthor, blogs: maxBlogs }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null
  
  const authorLikes = {}
  blogs.forEach(blog => {
    authorLikes[blog.author] = (authorLikes[blog.author] || 0) + blog.likes
  })
  
  let maxAuthor = null
  let maxLikes = 0
  for (const author in authorLikes) {
    if (authorLikes[author] > maxLikes) {
      maxAuthor = author
      maxLikes = authorLikes[author]
    }
  }
  
  return { author: maxAuthor, likes: maxLikes }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
} 