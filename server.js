require('dotenv').config();
const express = require('express');
const path = require('path');

const homeRouter = require('./routes/home');
const recipesRouter = require('./routes/recipes');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRouter);
app.use('/recipes', recipesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
