# Notes API

A simple RESTful API for managing notes built with Node.js and Express.

## Features

- Create, read, update, and delete notes
- Persistent storage using JSON file
- RESTful API design
- Error handling
- API documentation

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/notes-api.git
cd notes-api
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
npm start
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

| Method | Endpoint     | Description         |
|--------|--------------|---------------------|
| GET    | /            | API documentation   |
| GET    | /notes       | Get all notes       |
| GET    | /notes/:id   | Get a note by ID    |
| POST   | /notes       | Create a new note   |
| PATCH  | /notes/:id   | Update a note by ID |
| DELETE | /notes/:id   | Delete a note by ID |

## API Usage Examples

### Get all notes

```bash
curl -X GET http://localhost:3000/notes
```

Example response:
```json
[
  {
    "id": "1615478523000",
    "note_title": "Shopping List",
    "note_body": "Milk, Eggs, Bread",
    "created_at": "2023-03-11T16:35:23.000Z",
    "updated_at": "2023-03-11T16:35:23.000Z"
  },
  {
    "id": "1615478623000",
    "note_title": "Meeting Notes",
    "note_body": "Discuss project timeline and resource allocation",
    "created_at": "2023-03-11T16:37:03.000Z",
    "updated_at": "2023-03-11T16:45:23.000Z"
  }
]
```

### Get a note by ID

```bash
curl -X GET http://localhost:3000/notes/1615478523000
```

Example response:
```json
{
  "id": "1615478523000",
  "note_title": "Shopping List",
  "note_body": "Milk, Eggs, Bread",
  "created_at": "2023-03-11T16:35:23.000Z",
  "updated_at": "2023-03-11T16:35:23.000Z"
}
```

### Create a new note

```bash
curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"note_title": "Task List", "note_body": "Complete project documentation"}'
```

Example response:
```json
{
  "id": "1679412543000",
  "note_title": "Task List",
  "note_body": "Complete project documentation",
  "created_at": "2023-03-21T14:29:03.000Z",
  "updated_at": "2023-03-21T14:29:03.000Z"
}
```

### Update a note

```bash
curl -X PATCH http://localhost:3000/notes/1615478523000 \
  -H "Content-Type: application/json" \
  -d '{"note_body": "Milk, Eggs, Bread, Cheese"}'
```

Example response:
```json
{
  "id": "1615478523000",
  "note_title": "Shopping List",
  "note_body": "Milk, Eggs, Bread, Cheese",
  "created_at": "2023-03-11T16:35:23.000Z",
  "updated_at": "2023-03-21T14:35:43.000Z"
}
```

### Delete a note

```bash
curl -X DELETE http://localhost:3000/notes/1615478523000
```

Response: 204 No Content

## Testing with Postman

You can also test the API using Postman:

1. Import the following Postman collection:

```
https://www.postman.com/collections/your-collection-id
```

Alternatively, you can manually create requests in Postman:

1. Create a new collection called "Notes API"
2. Add requests for each endpoint:
   - GET http://localhost:3000/notes
   - GET http://localhost:3000/notes/:id
   - POST http://localhost:3000/notes
   - PATCH http://localhost:3000/notes/:id
   - DELETE http://localhost:3000/notes/:id

For POST and PATCH requests, set the body type to "raw" and format to "JSON".

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 400 Bad Request: Invalid request format
- 404 Not Found: Note not found
- 500 Internal Server Error: Server-side error

Example error response:
```json
{
  "error": "Note not found"
}
```

## Project Structure

```
notes-api/
├── node_modules/
├── public/
├── index.js        # Main application file
├── notes.json      # Data storage file
├── package.json
└── README.md
```

## Environment Variables

- `PORT`: The port on which the server will run (default: 3000)
- `NODE_ENV`: Set to "production" in production environments to limit error details

## License

MIT