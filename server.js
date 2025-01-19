// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/notesApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB')).catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose schema and model
const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    userId: { type: String, required: true }, // Replace with user authentication in future
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

noteSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Note = mongoose.model('Note', noteSchema);

// Routes

// Create a new note
app.post('/notes', async (req, res) => {
    try {
        const { title, content, userId } = req.body;
        const newNote = new Note({ title, content, userId });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create note', details: err.message });
    }
});

// Retrieve all notes for the current user
app.get('/notes', async (req, res) => {
    try {
        const { userId } = req.query; // Assuming userId is passed as a query parameter
        const notes = await Note.find({ userId });
        res.status(200).json(notes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve notes', details: err.message });
    }
});

// Retrieve a specific note by ID
app.get('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findById(id);
        if (!note) return res.status(404).json({ error: 'Note not found' });
        res.status(200).json(note);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve note', details: err.message });
    }
});

// Update an existing note
app.put('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { title, content, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        if (!updatedNote) return res.status(404).json({ error: 'Note not found' });
        res.status(200).json(updatedNote);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update note', details: err.message });
    }
});

// Delete a note
app.delete('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNote = await Note.findByIdAndDelete(id);
        if (!deletedNote) return res.status(404).json({ error: 'Note not found' });
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete note', details: err.message });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
