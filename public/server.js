const express = require('express');
const { Pool } = require('pg');

// Create an Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create a new pool instance for PostgreSQL
const pool = new Pool({
  user: 'postgres', // or the appropriate username
  host: 'localhost',
  database: 'hodlinfo',
  password: 'Smith@0410', // Updated password
  port: 5432,
});

// Connect to the database
pool.connect((err, client, release) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
  } else {
    console.log('Connected to the database');
    release();
  }
});

// Route to fetch data from PostgreSQL
app.get('/api/data', async (req, res) => {
  try {
    // Replace 'your_table' with the actual table name
    const result = await pool.query('SELECT * FROM cryptocurrencies');

    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).send('Error executing query');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
