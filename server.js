const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const marked = require('marked'); // You'll need to install this: npm install marked

const app = express();
const PORT = process.env.PORT || 3000;
const notesFilePath = path.join(__dirname, 'notes.json');
const readmePath = path.join(__dirname, 'README.md');

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read notes from the JSON file
const readNotes = async () => {
    try {
        await fs.access(notesFilePath).catch(async () => {
            await fs.writeFile(notesFilePath, JSON.stringify([]));
        });
        
        const data = await fs.readFile(notesFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading notes:", error);
        return []; // Return an empty array if there's an error
    }
};

// Helper function to write notes to the JSON file
const writeNotes = async (notes) => {
    try {
        await fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2));
        return true;
    } catch (error) {
        console.error("Error writing notes:", error);
        return false;
    }
};

// Create README.md file if it doesn't exist
const createReadmeIfNeeded = async () => {
    try {
        await fs.access(readmePath).catch(async () => {
            const readmeContent = `# Notes API

A simple RESTful API for managing notes built with Node.js and Express.

## Features

- Create, read, update, and delete notes
- Persistent storage using JSON file
- RESTful API design
- Error handling
- API documentation

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

\`\`\`bash
curl -X GET http://localhost:${PORT}/notes
\`\`\`

### Get a note by ID

\`\`\`bash
curl -X GET http://localhost:${PORT}/notes/YOUR_NOTE_ID
\`\`\`

### Create a new note

\`\`\`bash
curl -X POST http://localhost:${PORT}/notes \\
  -H "Content-Type: application/json" \\
  -d '{"note_title": "Task List", "note_body": "Complete project documentation"}'
\`\`\`

### Update a note

\`\`\`bash
curl -X PATCH http://localhost:${PORT}/notes/YOUR_NOTE_ID \\
  -H "Content-Type: application/json" \\
  -d '{"note_body": "Updated content"}'
\`\`\`

### Delete a note

\`\`\`bash
curl -X DELETE http://localhost:${PORT}/notes/YOUR_NOTE_ID
\`\`\`
`;
            await fs.writeFile(readmePath, readmeContent);
        });
    } catch (error) {
        console.error("Error creating README:", error);
    }
};

// Initialize README
createReadmeIfNeeded();

// API documentation at root
app.get('/', async (req, res, next) => {
    try {
        // Check if the client prefers HTML (browser) or plain text (curl, etc.)
        const acceptHeader = req.headers.accept || '';
        
        if (acceptHeader.includes('text/html')) {
            // Serve HTML version for browsers
            const readmeContent = await fs.readFile(readmePath, 'utf8');
            const htmlContent = marked.parse(readmeContent);
            
            res.send(`
                <html>
                    <head>
                        <title>Notes API Documentation</title>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; max-width: 800px; margin: 0 auto; }
                            h1 { color: #2c3e50; }
                            h2 { color: #3498db; margin-top: 30px; }
                            code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
                            pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
                            table { border-collapse: collapse; width: 100%; }
                            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
                            th { background-color: #f2f2f2; }
                        </style>
                    </head>
                    <body>
                        ${htmlContent}
                    </body>
                </html>
            `);
        } else {
            // Serve plain text README for command line tools
            const readmeContent = await fs.readFile(readmePath, 'utf8');
            res.type('text/plain').send(readmeContent);
        }
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? null : err.message
    });
});

// Get all notes
app.get('/notes', async (req, res, next) => {
    try {
        const notes = await readNotes();
        res.json(notes);
    } catch (error) {
        next(error);
    }
});

// Get a note by ID
app.get('/notes/:id', async (req, res, next) => {
    try {
        const notes = await readNotes();
        const note = notes.find(n => n.id === req.params.id);
        if (note) {
            res.json(note);
        } else {
            res.status(404).json({ error: 'Note not found' });
        }
    } catch (error) {
        next(error);
    }
});

// Create a new note
app.post('/notes', async (req, res, next) => {
    try {
        const { note_title, note_body } = req.body;
        if (!note_title || !note_body) {
            return res.status(400).json({
                error: 'Invalid structure. Expected: { note_title: string, note_body: string }'
            });
        }

        const notes = await readNotes();
        const newNote = {
            id: Date.now().toString(),
            note_title,
            note_body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        notes.push(newNote);
        
        const success = await writeNotes(notes);
        if (success) {
            res.status(201).json(newNote);
        } else {
            throw new Error('Failed to write note to storage');
        }
    } catch (error) {
        next(error);
    }
});

// Update a note by ID
app.patch('/notes/:id', async (req, res, next) => {
    try {
        const notes = await readNotes();
        const noteIndex = notes.findIndex(n => n.id === req.params.id);
        if (noteIndex === -1) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const { note_title, note_body } = req.body;
        if (note_title === undefined && note_body === undefined) {
            return res.status(400).json({
                error: 'Invalid structure. Expected at least one of: { note_title: string, note_body: string }'
            });
        }

        const updatedNote = {
            ...notes[noteIndex],
            note_title: note_title !== undefined ? note_title : notes[noteIndex].note_title,
            note_body: note_body !== undefined ? note_body : notes[noteIndex].note_body,
            updated_at: new Date().toISOString()
        };

        notes[noteIndex] = updatedNote;
        const success = await writeNotes(notes);
        
        if (success) {
            res.json(updatedNote);
        } else {
            throw new Error('Failed to update note in storage');
        }
    } catch (error) {
        next(error);
    }
});

// Delete a note by ID
app.delete('/notes/:id', async (req, res, next) => {
    try {
        const notes = await readNotes();
        const noteIndex = notes.findIndex(n => n.id === req.params.id);
        if (noteIndex === -1) {
            return res.status(404).json({ error: 'Note not found' });
        }

        notes.splice(noteIndex, 1);
        const success = await writeNotes(notes);
        
        if (success) {
            res.status(204).send();
        } else {
            throw new Error('Failed to delete note from storage');
        }
    } catch (error) {
        next(error);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}`);
});