const express = require('express');
const router = express.Router();
const pool = require('../db');

// جلب كل الوصفات
router.get('/all', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM recipes ORDER BY id');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// حذف وصفة
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM recipes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// مثال للتحديث (اختياري):
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, image, instructions, ingredients, readyIn } = req.body;
  try {
    const { rows } = await pool.query(`
      UPDATE recipes
      SET title=$1, image=$2, instructions=$3, ingredients=$4, readyIn=$5
      WHERE id = $6 RETURNING *`,
      [title, image, instructions, JSON.stringify(ingredients), readyIn, id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
