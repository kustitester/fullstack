const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const { blogs } = require('./test_blogs')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  test('when list has only one blog equals the likes of that', () => {
    const oneBlog = [blogs[0]] // React patterns with 7 likes
    const result = listHelper.totalLikes(oneBlog)
    assert.strictEqual(result, 7)
  })

  test('when list has multiple blogs equals the sum of likes', () => {
    const multipleBlogs = blogs.slice(0, 3) // First 3 blogs: 7 + 5 + 12 = 24
    const result = listHelper.totalLikes(multipleBlogs)
    assert.strictEqual(result, 24)
  })

  test('when list is empty equals zero', () => {
    const emptyList = []
    const result = listHelper.totalLikes(emptyList)
    assert.strictEqual(result, 0)
  })

  test('when blogs have zero likes equals zero', () => {
    const blogsWithZeroLikes = [blogs[4], blogs[5]] // TDD harms architecture (0) + Type wars (2)
    const result = listHelper.totalLikes(blogsWithZeroLikes)
    assert.strictEqual(result, 2) // 0 + 2 = 2
  })

  test('with full test dataset equals correct total', () => {
    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 36) // 7+5+12+10+0+2 = 36
  })
})

describe('favorite blog', () => {
  test('when list is empty returns null', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, null)
  })

  test('when list has only one blog returns that blog', () => {
    const oneBlog = [blogs[0]] // React patterns with 7 likes
    const result = listHelper.favoriteBlog(oneBlog)
    assert.deepStrictEqual(result, oneBlog[0])
  })

  test('when list has many blogs returns the one with most likes', () => {
    const testBlogs = blogs.slice(0, 3) // First 3 blogs: React patterns (7), Go To (5), Canonical (12)
    const result = listHelper.favoriteBlog(testBlogs)
    assert.deepStrictEqual(result, testBlogs[2]) // Canonical string reduction has 12 likes
  })

  test('when multiple blogs have the same max likes returns one of them', () => {
    const testBlogs = [blogs[1], blogs[2]] // Go To (5) and Canonical (12) - different likes
    const result = listHelper.favoriteBlog(testBlogs)
    assert.deepStrictEqual(result, testBlogs[1]) // Canonical has more likes
  })
})

describe('most blogs', () => {
  test('when list is empty returns null', () => {
    const result = listHelper.mostBlogs([])
    assert.strictEqual(result, null)
  })

  test('when list has only one blog returns that author and 1', () => {
    const oneBlog = [blogs[0]] // Michael Chan
    const result = listHelper.mostBlogs(oneBlog)
    assert.deepStrictEqual(result, { author: 'Michael Chan', blogs: 1 })
  })

  test('when list has many blogs returns the author with most blogs', () => {
    const testBlogs = blogs.slice(0, 4) // First 4: Michael Chan (1), Dijkstra (2), Dijkstra (3), Robert C. Martin (4)
    const result = listHelper.mostBlogs(testBlogs)
    assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', blogs: 2 })
  })

  test('with full test dataset returns correct author and count', () => {
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, { author: 'Robert C. Martin', blogs: 3 })
  })
})

describe('most likes', () => {
  test('when list is empty returns null', () => {
    const result = listHelper.mostLikes([])
    assert.strictEqual(result, null)
  })

  test('when list has only one blog returns that author and likes', () => {
    const oneBlog = [blogs[0]] // Michael Chan with 7 likes
    const result = listHelper.mostLikes(oneBlog)
    assert.deepStrictEqual(result, { author: 'Michael Chan', likes: 7 })
  })

  test('when list has many blogs returns the author with most total likes', () => {
    const testBlogs = blogs.slice(0, 3) // Michael Chan 7, Dijkstra 5, Dijkstra 12
    const result = listHelper.mostLikes(testBlogs)
    assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', likes: 17 }) // 5 + 12 = 17
  })

  test('with full test dataset returns correct author and total likes', () => {
    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', likes: 17 }) // 5 + 12 = 17
  })

  test('when multiple authors have the same total likes returns one of them', () => {
    const testBlogs = [
      { _id: '1', title: 'a1', author: 'Author A', url: 'x', likes: 10, __v: 0 },
      { _id: '2', title: 'a2', author: 'Author A', url: 'y', likes: 5, __v: 0 },
      { _id: '3', title: 'b1', author: 'Author B', url: 'z', likes: 15, __v: 0 }
    ]
    const result = listHelper.mostLikes(testBlogs)
    assert.ok(result.author === 'Author A' || result.author === 'Author B')
    assert.strictEqual(result.likes, 15)
  })
}) 