const express = require('express');
const router = express.Router();
const pg = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const verifyToken = require('../middleware/verifyToken');

// Register new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error during registration:', error);
    if (error.code === '23505') {
      // Duplicate username or email
      return res.status(409).send('Username or email already exists');
    }
    res.status(500).send('Server error');
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).send('Username not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Server error');
  }
});

// Get user profile (protected route)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT username, email FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).send('Error fetching profile');
  }
});

module.exports = router;
