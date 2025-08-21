vi.mock('../services/blogs', () => ({
  default: {
    update: vi.fn().mockResolvedValue({}),
  }
}))

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

const blog = {
  id: 'testid123',
  title: 'Test Blog Title',
  author: 'Test Author',
  url: 'http://testurl.com',
  likes: 5,
  user: {
    username: 'testuser',
    name: 'Test User',
    id: '12345'
  }
}

test('renders blog title and author but not url or likes by default', () => {
  render(<Blog blog={blog} updateBlog={() => {}} removeBlog={() => {}} user={{}} />)

  // Title and author should be visible (partial match)
  expect(screen.getByText(/Test Blog Title/)).toBeDefined()
  expect(screen.getByText(/Test Author/)).toBeDefined()

  // url and likes should not be in the document
  expect(screen.queryByText('http://testurl.com')).toBeNull()
  expect(screen.queryByText('likes 5')).toBeNull()
})

test('shows url, likes and user after clicking view', async () => {
  const user = userEvent.setup()
  render(<Blog blog={blog} updateBlog={() => {}} removeBlog={() => {}} user={{}} />)

  // Klikataan view-nappia
  const button = screen.getByText('view')
  await user.click(button)

  // Nyt url, likes ja käyttäjän nimi pitäisi näkyä
  expect(screen.getByText('http://testurl.com')).toBeDefined()
  expect(screen.getByText(/likes 5/)).toBeDefined()
  expect(screen.getByText('Test User')).toBeDefined()
})

test('like button calls handler twice when clicked twice', async () => {
  const user = userEvent.setup()
  const mockHandler = vi.fn()
  render(<Blog blog={blog} updateBlog={mockHandler} removeBlog={() => {}} user={{}} />)

  // Näytä kaikki tiedot
  await user.click(screen.getByText('view'))

  // Klikkaa like-nappia kahdesti
  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
}) 