const router = require('express').Router();
const axios = require('axios');
const BASE = 'https://api.spoonacular.com';

router.get('/random', async (req, res) => {
   console.log('🔁 /recipes/random hit');
  try {
    const { data } = await axios.get(`${BASE}/recipes/random`, {
      params: { number: 1, apiKey: process.env.SPOON_KEY }
    });
    const r = data.recipes[0];
    res.json({
      title: r.title,
      image: r.image,
      instructions: r.instructions,
      ingredients: r.extendedIngredients.map(i => i.original)
    });
  } catch {
    res.status(500).json({ error: 'API Error' });
  }
});

router.get('/search', async (req, res) => {
   console.log('🌐 Search endpoint called with:', req.query.ingredients);
  const { ingredients } = req.query;
  if (!ingredients) return res.status(400).json({ error: 'No ingredients' });
  try {
    const { data } = await axios.get(`${BASE}/recipes/findByIngredients`, {
      params: { ingredients, number: 10, apiKey: process.env.SPOON_KEY }
    });
    res.json(data.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image,
      usedIngredients: r.usedIngredients.map(i => i.name),
      missedIngredients: r.missedIngredients.map(i => i.name)
    })));
  } catch {
    res.status(500).json({ error: 'API Error' });
  }
});

module.exports = router;
