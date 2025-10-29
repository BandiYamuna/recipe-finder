// Smooth scroll to search section when "Get Started" button clicked
document.querySelector('.btn[href="#search"]').addEventListener('click', function (e) {
  e.preventDefault();
  document.querySelector('#search').scrollIntoView({ behavior: 'smooth' });
});

// Elements
const queryInput = document.getElementById('query');
const byIngredientBtn = document.getElementById('by-ingredient');
const byNameBtn = document.getElementById('by-name');
const resultsSection = document.getElementById('results');
const status = document.getElementById('status');
const detailPanel = document.getElementById('detailPanel');
const detailContent = document.getElementById('detailContent');
const closeDetail = document.getElementById('closeDetail');

// Fetch meals by ingredient
async function fetchByIngredient(ingredient) {
  status.textContent = 'Loading recipes...';
  resultsSection.innerHTML = '';
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
  const data = await res.json();
  displayMeals(data.meals);
}

// Fetch meals by name
async function fetchByName(name) {
  status.textContent = 'Loading recipes...';
  resultsSection.innerHTML = '';
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`);
  const data = await res.json();
  displayMeals(data.meals);
}

// Display recipe cards
function displayMeals(meals) {
  if (!meals) {
    status.textContent = 'No recipes found. Try another ingredient or name.';
    return;
  }

  status.textContent = '';
  resultsSection.innerHTML = meals.map(meal => `
    <div class="meal-card" data-id="${meal.idMeal}">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
      <h3>${meal.strMeal}</h3>
    </div>
  `).join('');

  // Add click event to each recipe card
  document.querySelectorAll('.meal-card').forEach(card => {
    card.addEventListener('click', () => showDetails(card.dataset.id));
  });
}

// Show recipe details and scroll DOWN to it
async function showDetails(id) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  const data = await res.json();
  const meal = data.meals[0];

  // Create ingredients list
  const ingredients = getIngredients(meal);

  // Fill in detail content
  detailContent.innerHTML = `
    <h2>${meal.strMeal}</h2>
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="detail-img" />
    
    <h3>Ingredients</h3>
    <ul>
      ${ingredients.map((i) => `<li>${i}</li>`).join("")}
    </ul>

    <h3>Instructions</h3>
    <p>${meal.strInstructions}</p>

    <p style="color: #1f1e1eff; font-weight: bold;">Chef’s Tip: Serve hot with rice or bread!</p>

    ${meal.strYoutube 
      ? `<h3>🎥 Watch Recipe Video</h3>
         <iframe width="100%" height="315"
           src="https://www.youtube.com/embed/${meal.strYoutube.split("v=")[1]}"
           title="YouTube recipe video"
           frameborder="0"
           allowfullscreen>
         </iframe>`
      : `<p style="color:gray;">No video available for this recipe.</p>`}
  `;


  // Show the detail section
  detailPanel.classList.add('open');
  detailPanel.setAttribute('aria-hidden', 'false');

  // 🔽 Smooth scroll DOWN to the details section
  detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Extract ingredient + measure list
function getIngredients(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      list.push(`${ing} - ${measure}`);
    }
  }
  return list;
}

// Close the details panel
closeDetail.addEventListener('click', () => {
  detailPanel.classList.remove('open');
  detailPanel.setAttribute('aria-hidden', 'true');
  window.scrollTo({ top: resultsSection.offsetTop, behavior: 'smooth' });
});

// Search actions
byIngredientBtn.addEventListener('click', () => {
  const query = queryInput.value.trim();
  if (query) fetchByIngredient(query);
});

byNameBtn.addEventListener('click', () => {
  const query = queryInput.value.trim();
  if (query) fetchByName(query);
});

// Quick suggestion chips
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    queryInput.value = chip.textContent;
    fetchByIngredient(chip.textContent);
  });
});
