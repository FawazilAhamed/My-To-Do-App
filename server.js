const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = 3000;


app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',          
    host: 'localhost',
    database: 'todo_app',       
    password: 'FawazilAhamed2464',  
    port: 5432
});

// Testing  DB connection
pool.connect()
    .then(() => console.log('✅ Connected to PostgreSQL'))
    .catch(err => console.error('DB connection error:', err));



// Get all todo,s
app.get('/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});


// Adding a new todo with priority
app.post('/todos', async (req, res) => {
    const { title, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    try {
        const result = await pool.query(
            'INSERT INTO todos (title, completed, priority) VALUES ($1, false, $2) RETURNING *',
            [title, priority || 'Medium']
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});


// Toggle completed
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    try {
        const result = await pool.query(
            'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *',
            [completed, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});

// Deleting a todo
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM todos WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});

// Clearing completed todo
app.delete('/todos/completed', async (req, res) => {
    try {
        await pool.query('DELETE FROM todos WHERE completed = true');
        res.json({ message: 'All completed todos cleared' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});


// Serve frontend
app.use(express.static('public'));

// Start server
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
