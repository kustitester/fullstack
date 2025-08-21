const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }, testInfo) => {
    const browserName = testInfo.project.name
    
    //await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: `Test User ${browserName}`,
        username: `testuser_${browserName}`,
        password: 'password123'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
    await expect(page.getByTestId('username')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }, testInfo) => {
      const browserName = testInfo.project.name
      const username = `testuser_${browserName}`
      
      await page.getByTestId('username').fill(username)
      await page.getByTestId('password').fill('password123')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByRole('heading', { name: 'Log in to application' })).not.toBeVisible()
      await expect(page.getByRole('heading', { name: 'blogs' })).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }, testInfo) => {
      const browserName = testInfo.project.name
      const username = `testuser_${browserName}`
      
      await page.getByTestId('username').fill(username)
      await page.getByTestId('password').fill('wrongpassword')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('wrong username or password')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }, testInfo) => {
      const browserName = testInfo.project.name
      const username = `testuser_${browserName}`
      
      await page.getByTestId('username').fill(username)
      await page.getByTestId('password').fill('password123')
      await page.getByRole('button', { name: 'login' }).click()
      
      await page.waitForTimeout(500)
      await expect(page.getByRole('heading', { name: 'blogs' })).toBeVisible()
    })

    test('a new blog can be created', async ({ page }, testInfo) => {
      const browserName = testInfo.project.name
      const blogTitle = `Test Blog ${browserName}`
      const blogAuthor = `Test Author ${browserName}`
      const blogUrl = `http://test-${browserName}.com`
      
      await page.getByRole('button', { name: 'create new blog' }).click()
      
      await page.getByRole('textbox', { name: 'title' }).clear()
      await page.getByRole('textbox', { name: 'title' }).fill(blogTitle)
      await page.getByRole('textbox', { name: 'author' }).clear()
      await page.getByRole('textbox', { name: 'author' }).fill(blogAuthor)
      await page.getByRole('textbox', { name: 'url' }).clear()
      await page.getByRole('textbox', { name: 'url' }).fill(blogUrl)
      
      await page.getByRole('button', { name: 'create' }).click()
      
      await expect(page.getByText(`${blogTitle} ${blogAuthor}`)).toBeVisible()
    })

    test('a blog can be liked', async ({ page }, testInfo) => {
      const browserName = testInfo.project.name
      const blogTitle = `Test Blog ${browserName}`
      const blogAuthor = `Test Author ${browserName}`
      
      await expect(page.getByText(`${blogTitle} ${blogAuthor}`)).toBeVisible()
      
      const blogElement = page.locator(`text=${blogTitle} ${blogAuthor}`).first()
      const viewButton = blogElement.locator('xpath=..').getByRole('button', { name: 'view' })
      await viewButton.click()
      
      await expect(page.getByText('likes 0')).toBeVisible()
      
      const likeButton = blogElement.locator('xpath=..').getByRole('button', { name: 'like' })
      await likeButton.click()
      
      await expect(page.getByText('likes 1')).toBeVisible()
    })

    test('user can delete their own blog', async ({ page }, testInfo) => {
      const browserName = testInfo.project.name
      const blogTitle = `Delete Test Blog ${browserName}`
      const blogAuthor = `Delete Test Author ${browserName}`
      const blogUrl = `http://delete-test-${browserName}.com`
      
      await page.getByRole('button', { name: 'create new blog' }).click()
      
      await page.getByRole('textbox', { name: 'title' }).clear()
      await page.getByRole('textbox', { name: 'title' }).fill(blogTitle)
      await page.getByRole('textbox', { name: 'author' }).clear()
      await page.getByRole('textbox', { name: 'author' }).fill(blogAuthor)
      await page.getByRole('textbox', { name: 'url' }).clear()
      await page.getByRole('textbox', { name: 'url' }).fill(blogUrl)
      
      await page.getByRole('button', { name: 'create' }).click()
      
      await expect(page.getByText(`${blogTitle} ${blogAuthor}`)).toBeVisible()
      
      const blogElement = page.locator(`text=${blogTitle} ${blogAuthor}`).first()
      const viewButton = blogElement.locator('xpath=..').getByRole('button', { name: 'view' })
      await viewButton.click()
      
      await expect(page.getByRole('button', { name: 'delete' })).toBeVisible()
      
      page.on('dialog', dialog => dialog.accept())
      
      const deleteButton = blogElement.locator('xpath=..').getByRole('button', { name: 'delete' })
      await deleteButton.click()
      
      await expect(page.getByText(`${blogTitle} ${blogAuthor}`)).not.toBeVisible()
    })

    test('only blog creator can see delete button', async ({ page, request }, testInfo) => {
      const browserName = testInfo.project.name
      const blogTitle = `Permission Test Blog ${browserName}`
      const blogAuthor = `Permission Test Author ${browserName}`
      const blogUrl = `http://permission-test-${browserName}.com`
      
      await request.post('http://localhost:3003/api/users', {
        data: {
          name: `Second User ${browserName}`,
          username: `seconduser_${browserName}`,
          password: 'password123'
        }
      })
      
      await page.getByRole('button', { name: 'create new blog' }).click()
      
      await page.getByRole('textbox', { name: 'title' }).clear()
      await page.getByRole('textbox', { name: 'title' }).fill(blogTitle)
      await page.getByRole('textbox', { name: 'author' }).clear()
      await page.getByRole('textbox', { name: 'author' }).fill(blogAuthor)
      await page.getByRole('textbox', { name: 'url' }).clear()
      await page.getByRole('textbox', { name: 'url' }).fill(blogUrl)
      
      await page.getByRole('button', { name: 'create' }).click()
      
      await expect(page.getByText(`${blogTitle} ${blogAuthor}`)).toBeVisible()
      
      const blogElement = page.locator(`text=${blogTitle} ${blogAuthor}`).first()
      const viewButton = blogElement.locator('xpath=..').getByRole('button', { name: 'view' })
      await viewButton.click()
      
      await expect(page.getByRole('button', { name: 'delete' })).toBeVisible()
      
      await page.getByRole('button', { name: 'logout' }).click()
      
      await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
      
      const secondUsername = `seconduser_${browserName}`
      await page.getByTestId('username').fill(secondUsername)
      await page.getByTestId('password').fill('password123')
      await page.getByRole('button', { name: 'login' }).click()
      
      await expect(page.getByRole('heading', { name: 'blogs' })).toBeVisible()
      
      const blogElementSecondUser = page.locator(`text=${blogTitle} ${blogAuthor}`).first()
      const viewButtonSecondUser = blogElementSecondUser.locator('xpath=..').getByRole('button', { name: 'view' })
      await viewButtonSecondUser.click()
      
      await expect(page.getByRole('button', { name: 'delete' })).not.toBeVisible()
    })

    test('blogs are sorted by likes in descending order', async ({ page }, testInfo) => {
      const browserName = testInfo.project.name
      
      const blog1Title = `Sort Test Blog 1 ${browserName}`
      const blog1Author = `Sort Test Author 1 ${browserName}`
      const blog1Url = `http://sort-test-1-${browserName}.com`
      
      const blog2Title = `Sort Test Blog 2 ${browserName}`
      const blog2Author = `Sort Test Author 2 ${browserName}`
      const blog2Url = `http://sort-test-2-${browserName}.com`
      
      const blog3Title = `Sort Test Blog 3 ${browserName}`
      const blog3Author = `Sort Test Author 3 ${browserName}`
      const blog3Url = `http://sort-test-3-${browserName}.com`
      
      // Create first blog
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByRole('textbox', { name: 'title' }).clear()
      await page.getByRole('textbox', { name: 'title' }).fill(blog1Title)
      await page.getByRole('textbox', { name: 'author' }).clear()
      await page.getByRole('textbox', { name: 'author' }).fill(blog1Author)
      await page.getByRole('textbox', { name: 'url' }).clear()
      await page.getByRole('textbox', { name: 'url' }).fill(blog1Url)
      await page.getByRole('button', { name: 'create' }).click()
      
      // Create second blog
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByRole('textbox', { name: 'title' }).clear()
      await page.getByRole('textbox', { name: 'title' }).fill(blog2Title)
      await page.getByRole('textbox', { name: 'author' }).clear()
      await page.getByRole('textbox', { name: 'author' }).fill(blog2Author)
      await page.getByRole('textbox', { name: 'url' }).clear()
      await page.getByRole('textbox', { name: 'url' }).fill(blog2Url)
      await page.getByRole('button', { name: 'create' }).click()
      
      // Create third blog
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByRole('textbox', { name: 'title' }).clear()
      await page.getByRole('textbox', { name: 'title' }).fill(blog3Title)
      await page.getByRole('textbox', { name: 'author' }).clear()
      await page.getByRole('textbox', { name: 'author' }).fill(blog3Author)
      await page.getByRole('textbox', { name: 'url' }).clear()
      await page.getByRole('textbox', { name: 'url' }).fill(blog3Url)
      await page.getByRole('button', { name: 'create' }).click()
      
      await expect(page.getByText(`${blog1Title} ${blog1Author}`)).toBeVisible()
      await expect(page.getByText(`${blog2Title} ${blog2Author}`)).toBeVisible()
      await expect(page.getByText(`${blog3Title} ${blog3Author}`)).toBeVisible()
      
      // Add likes: Blog 1 (3), Blog 2 (10), Blog 3 (5)
      const blog1Element = page.locator(`text=${blog1Title} ${blog1Author}`).first()
      const blog1ViewButton = blog1Element.locator('xpath=..').getByRole('button', { name: 'view' })
      await blog1ViewButton.click()
      const blog1LikeButton = blog1Element.locator('xpath=..').getByRole('button', { name: 'like' })
      for (let i = 0; i < 3; i++) {
        await blog1LikeButton.click()
      }
      
      const blog2Element = page.locator(`text=${blog2Title} ${blog2Author}`).first()
      const blog2ViewButton = blog2Element.locator('xpath=..').getByRole('button', { name: 'view' })
      await blog2ViewButton.click()
      const blog2LikeButton = blog2Element.locator('xpath=..').getByRole('button', { name: 'like' })
      for (let i = 0; i < 10; i++) {
        await blog2LikeButton.click()
      }
      
      const blog3Element = page.locator(`text=${blog3Title} ${blog3Author}`).first()
      const blog3ViewButton = blog3Element.locator('xpath=..').getByRole('button', { name: 'view' })
      await blog3ViewButton.click()
      const blog3LikeButton = blog3Element.locator('xpath=..').getByRole('button', { name: 'like' })
      for (let i = 0; i < 5; i++) {
        await blog3LikeButton.click()
      }
      
      await page.waitForTimeout(1000)
      
      const blog2ElementForPosition = page.locator(`text=${blog2Title} ${blog2Author}`).first()
      const blog3ElementForPosition = page.locator(`text=${blog3Title} ${blog3Author}`).first()
      const blog1ElementForPosition = page.locator(`text=${blog1Title} ${blog1Author}`).first()
      
      const blog2Position = await blog2ElementForPosition.evaluate(el => {
        const parent = el.closest('div[style*="border"]')
        if (!parent) return -1
        const siblings = Array.from(parent.parentNode.children)
        return siblings.indexOf(parent)
      })
      
      const blog3Position = await blog3ElementForPosition.evaluate(el => {
        const parent = el.closest('div[style*="border"]')
        if (!parent) return -1
        const siblings = Array.from(parent.parentNode.children)
        return siblings.indexOf(parent)
      })
      
      const blog1Position = await blog1ElementForPosition.evaluate(el => {
        const parent = el.closest('div[style*="border"]')
        if (!parent) return -1
        const siblings = Array.from(parent.parentNode.children)
        return siblings.indexOf(parent)
      })
      
      expect(blog2Position).toBeLessThan(blog3Position)
      expect(blog3Position).toBeLessThan(blog1Position)
      
      await expect(blog2ElementForPosition).toBeVisible()
      await expect(blog3ElementForPosition).toBeVisible()
      await expect(blog1ElementForPosition).toBeVisible()
    })
  })
}) 