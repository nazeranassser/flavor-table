async function testSearch() {
  console.log('Search listener ready');
}
testSearch();

// البحث بالمكوّنات
document.getElementById('searchForm').addEventListener('submit', async e => {
  e.preventDefault();
  const q = document.getElementById('ingredientsInput').value;
   console.log('Fetching search for:', q);
  const res = await fetch(`/recipes/search?ingredients=${q}`);
  const data = await res.json();
  console.log('Search results:', data);
  renderCards(data);
});

// توليد وصفة عشوائية
document.getElementById('randomBtn').onclick = async () => {
  const res = await fetch('/recipes/random');
  const data = await res.json();
  console.log('Random recipe:', data);
  renderRandom(data);
};

// مثال دوال عرض (يمكن تعديلها حسب التصميم)
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

function saveFav(recipe) {
  const favs = JSON.parse(localStorage.getItem('favs') || '[]');
  favs.push(recipe);
  localStorage.setItem('favs', JSON.stringify(favs));
  alert('Saved!');
}
