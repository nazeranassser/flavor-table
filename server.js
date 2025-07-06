// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');          // تحقق من أن db.js يحتوي setup صحيح
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const SPOON_KEY = process.env.SPOON_KEY;
const BASE = 'https://api.spoonacular.com';


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔍 Search recipes via Spoonacular API
app.get('/recipes/search', async (req, res) => {
  const { ingredients } = req.query;
  if (!ingredients) return res.status(400).json({ error: 'No ingredients provided' });
  try {
    const { data } = await axios.get(`${BASE}/recipes/findByIngredients`, {
      params: { ingredients, number: 10, apiKey: SPOON_KEY }
    });
    const list = data.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image,
      usedIngredients: r.usedIngredients.map(i => i.name),
      missedIngredients: r.missedIngredients.map(i => i.name),
      instructions: null,
      readyIn: null
    }));
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'API Error' });
  }
});

// 🎲 Get one random recipe
app.get('/recipes/random', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE}/recipes/random`, {
      params: { number: 1, apiKey: SPOON_KEY }
    });
    const r = data.recipes[0];
    res.json({
      id: r.id,
      title: r.title,
      image: r.image,
      instructions: r.instructions,
      ingredients: r.extendedIngredients.map(i => i.original),
      readyIn: r.readyInMinutes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'API Error' });
  }
});

// 📥 Fetch all saved recipes from Postgres
app.get('/api/recipes/all', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM recipes ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 💾 Save a new favorite recipe to Postgres
app.post('/api/recipes', async (req, res) => {
  const { title, image, instructions, ingredients, readyIn } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO recipes (title, image, instructions, ingredients, readyIn)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [title, image, instructions, ingredients, readyIn]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🗑️ Delete a saved recipe by ID
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM recipes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



// 📝 Optional: Update saved recipe by ID
app.put('/api/recipes/:id', async (req, res) => {
  const { title, image, instructions, ingredients, readyIn } = req.body;
  const id = req.params.id;

  // ✅ أضيفي هذا السطر لطباعة البيانات المستلمة
  console.log('🔄 Request to update:', { id, title, image, instructions, ingredients, readyIn });

  try {
    const { rows } = await pool.query(
      `UPDATE recipes
       SET title=$1, image=$2, instructions=$3, ingredients=$4, readyIn=$5
       WHERE id=$6 RETURNING *`,
      [title, image, instructions, ingredients, readyIn, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error during update:', err);
    res.status(500).json({ error: err.message });
  }
});



app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
