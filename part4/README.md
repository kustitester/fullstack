# Bloglist Application

A modular Express.js application for managing blog posts with MongoDB.

## Project Structure

```
├── controllers/
│   └── blogs.js          # Blog route handlers
├── models/
│   └── blog.js           # Blog mongoose model
├── utils/
│   ├── config.js         # Configuration (database URL, etc.)
│   ├── logger.js         # Logging utilities
│   └── middleware.js     # Express middleware
├── app.js                # Express application setup
├── index.js              # Server startup and database connection
└── package.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure MongoDB is running locally or update the connection string in `index.js` to use MongoDB Atlas.

3. Run the application in development mode with auto-restart:
```bash
npm run dev
```

Or run normally:
```bash
npm start
```

The server will start on port 3003.

## API Endpoints

- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create a new blog

### Example POST request body:
```json
{
  "title": "My First Blog",
  "author": "John Doe",
  "url": "https://example.com/blog",
  "likes": 10
}
```

## Testing with Postman or VS Code REST Client

You can test the API endpoints using:
- Postman
- VS Code REST Client extension
- curl commands

### Example curl commands:

Get all blogs:
```bash
curl http://localhost:3003/api/blogs
```

Create a new blog:
```bash
curl -X POST http://localhost:3003/api/blogs \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Blog","author":"Test Author","url":"https://test.com","likes":5}'
``` 