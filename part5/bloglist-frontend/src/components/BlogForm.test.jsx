vi.mock('../services/blogs', () => ({
  default: {
    create: vi.fn().mockResolvedValue({
      title: 'Test Title',
      author: 'Test Author',
      url: 'http://testurl.com'
    }),
  }
}))

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('BlogForm calls createBlog with correct details', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn()

  render(<BlogForm createBlog={createBlog} />)

  const titleInput = screen.getByLabelText(/title/i)
  const authorInput = screen.getByLabelText(/author/i)
  const urlInput = screen.getByLabelText(/url/i)
  const sendButton = screen.getByText('create')

  await user.type(titleInput, 'Test Title')
  await user.type(authorInput, 'Test Author')
  await user.type(urlInput, 'http://testurl.com')
  await user.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toMatchObject({
    title: 'Test Title',
    author: 'Test Author',
    url: 'http://testurl.com'
  })
}) 