console.log('Script loaded');

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready');

  const form = document.getElementById('searchForm');
  console.log('Looking for #searchForm:', form);
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const q = document.getElementById('ingredientsInput').value;
      console.log('Fetching search for:', q);
      const res = await fetch(`/recipes/search?ingredients=${encodeURIComponent(q)}`);

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Search results:', data);
      renderCards(data);

      console.log('Search status:', res.status);
    });
  }

  const btn = document.getElementById('randomBtn');
  console.log('Looking for #randomBtn:', btn);
  if (btn) {
    btn.onclick = async () => {
      console.log('🔁 Button clicked');
      const res = await fetch('/recipes/random');
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Random recipe data:', data);
      renderRandom(data);
    };
  }

  const favSec = document.getElementById('favoritesList');
  if (favSec) {
    console.log('Loading favorites...');
    loadFavorites();
  }

  // ✅ Handle update form submit
  const updateForm = document.getElementById('updateForm');
  if (updateForm) {
    updateForm.addEventListener('submit', async e => {
      e.preventDefault();

      const id = document.getElementById('updateId').value;
      const updatedRecipe = {
        title: document.getElementById('updateTitle').value,
        image: document.getElementById('updateImage').value,
        ingredients: JSON.stringify(
          document.getElementById('updateIngredients').value
            .split(',')
            .map(i => i.trim())
        ),
        instructions: document.getElementById('updateInstructions').value,
      };

      try {
        await axios.put(`/api/recipes/${id}`, updatedRecipe);
        alert('Recipe updated successfully');
        updateForm.style.display = 'none';
        loadFavorites(); // Reload updated list
      } catch (err) {
        console.error(err);
        alert('An error occurred while updating');
      }
    });
  }
});

// 📦 Render recipe cards (for search or random)
function renderCards(list) {
  const sec = document.getElementById('results');
  sec.innerHTML = '';
  list.forEach(r => {
    const div = document.createElement('div');
    div.innerHTML = `<h3>${r.title}</h3><img src="${r.image}" width="100">`;
    const btn = document.createElement('button');
    btn.textContent = 'Save';
    btn.onclick = () => saveFav(r);

    div.append(btn);
    sec.append(div);
  });
}

function renderRandom(r) {
  const sec = document.getElementById('randomResult');
  sec.innerHTML = `
    <h2>${r.title}</h2>
    <img src="${r.image}" width="200">
    <h3>Ingredients:</h3><ul>${r.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
    <h3>Instructions:</h3><p>${r.instructions}</p>
  `;
}

// ✅ Save a recipe to PostgreSQL
async function saveFav(recipe) {
  try {
    const res = await axios.post('/api/recipes', {
      title: recipe.title,
      image: recipe.image,
      instructions: recipe.instructions,
      ingredients: recipe.ingredients,
      readyIn: recipe.readyIn || null
    });
    alert('Recipe saved to database');
  } catch (err) {
    console.error(err);
    alert('Error while saving');
  }
}

// ✅ Load saved recipes from PostgreSQL
async function loadFavorites() {
  try {
    const res = await axios.get('/api/recipes/all');
    renderFavorites(res.data);
  } catch (err) {
    console.error(err);
  }
}

// ❌ Delete recipe by ID
async function deleteRecipe(id) {
  try {
    await axios.delete(`/api/recipes/${id}`);
    loadFavorites(); // Reload after delete
  } catch (err) {
    console.error(err);
    alert('Error while deleting');
  }
}

// ✅ Display all saved favorites + edit/delete buttons
function renderFavorites(savedRecipes) {
  const favList = document.getElementById('favoritesList');
  favList.innerHTML = '';
  if (!savedRecipes.length) {
    favList.innerHTML = '<p>No favorite recipes found.</p>';
    return;
  }

  savedRecipes.forEach(recipe => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${recipe.title}</h3>
      ${recipe.image ? `<img src="${recipe.image}" width="100">` : ''}
      <button onclick="deleteRecipe(${recipe.id})">Delete</button>
    `;

    // ✅ Create "Edit" button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => {
      document.getElementById('updateId').value = recipe.id;
      document.getElementById('updateTitle').value = recipe.title;
      document.getElementById('updateImage').value = recipe.image || '';
      document.getElementById('updateIngredients').value = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join(', ')
        : recipe.ingredients;
      document.getElementById('updateInstructions').value = recipe.instructions;
      document.getElementById('updateForm').style.display = 'block';
    };
    div.appendChild(editBtn);

    favList.appendChild(div);
  });
}

// ✅ Make deleteRecipe globally available
window.deleteRecipe = deleteRecipe;
