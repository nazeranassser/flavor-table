console.log('Script loaded');

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready');

  // التعامل مع نموذج البحث إذا كان موجود
  const form = document.getElementById('searchForm');
  console.log('Looking for #searchForm:', form);
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const q = document.getElementById('ingredientsInput').value;
      console.log('Fetching search for:', q);
      const res = await fetch(`/recipes/search?ingredients=${q}`);
      console.log('Search status:', res.status);
      const data = await res.json();
      console.log('Search results:', data);
      renderCards(data);
    });
  }

  // التعامل مع زر الوصفة العشوائية إذا كان موجود
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

  // تحميل المفضلات عند وجود القسم الخاص بها في الصفحة
  if (document.getElementById('favoritesList')) {
    console.log('Loading favorites...');
    loadFavorites();
  }
});

// دوال عرض النتائج

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

// حفظ الوصفة في localStorage مع التحقق من التكرار
function saveFav(recipe) {
  const favs = JSON.parse(localStorage.getItem('favs') || '[]');
  if (!favs.some(r => r.title === recipe.title)) {
    favs.push(recipe);
    localStorage.setItem('favs', JSON.stringify(favs));
    alert('Saved!');
  } else {
    alert('Recipe already saved!');
  }
}

// تحميل وعرض المفضلات من localStorage في صفحة المفضلة
function loadFavorites() {
  const savedRecipes = JSON.parse(localStorage.getItem('favs')) || [];
  const favoritesList = document.getElementById('favoritesList');
  favoritesList.innerHTML = '';

  if (savedRecipes.length === 0) {
    favoritesList.innerHTML = '<p>No favorite recipes saved yet.</p>';
    return;
  }

  savedRecipes.forEach(recipe => {
    const recipeElement = document.createElement('div');
    recipeElement.classList.add('recipe');
    recipeElement.innerHTML = `
      <h3>${recipe.title}</h3>
      ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" width="100">` : ''}
    `;
    favoritesList.appendChild(recipeElement);
  });
}
