// finish header before showing document

let lang = navigator.language.includes('fi') ? 'fi' : 'en'; // automatically get from location (muse)
const foodName = document.getElementById('name');
const fs = document.getElementById('fs');
const ff = document.getElementById('ff');
const fe = document.getElementById('fe');

const setTableHeaders = () => {
  if (lang === 'fi') {
    foodName.innerHTML = 'nimi';
    fs.innerHTML = 'kuitu<div></div>sokeri';
    ff.innerHTML = 'kuitu<div></div>rasva';
    fe.innerHTML = 'kuitu<div></div>1000kcal';
  } else {
    foodName.innerHTML = 'name';
    fs.innerHTML = 'fiber<div></div>sugar';
    ff.innerHTML = 'fiber<div></div>fat';
    fe.innerHTML = 'fiber<div></div>1000kcal';
  }
};
setTableHeaders();

document.documentElement.style.opacity = 1;

//
// load foods data

const response = await fetch('./foods.tsv');
if (!response.ok) {
  throw new Error('Failed to load foods.tsv');
}

const tsv = await response.text();

const foods = [];
{
  const capitalize = (text) =>
    text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

  const lines = tsv.split(/\n/).filter((line) => line.trim() !== '');
  const header = lines[0].split(/\t/);
  const rows = lines.slice(1).map((row) => row.split(/\t/));

  rows.forEach((row) => {
    foods.push({
      fi: capitalize(row[header.indexOf('fi')]),
      en: capitalize(row[header.indexOf('en')]),
      energy: row[header.indexOf('energy')],
      fat: row[header.indexOf('fat')],
      sugar: row[header.indexOf('sugar')],
      fiber: row[header.indexOf('fiber')],
      category: row[header.indexOf('category')],
    });
  });

  foods.sort((a, b) => a.fi.localeCompare(b.fi));
}

//
// implement logic

let filteredFoods = [...foods];
let sort = 'name'; // name/fs/ff/fe

const toggle = document.getElementById('toggle');
const fi = document.getElementById('fi');
const en = document.getElementById('en');
const sort_fi = document.getElementById('sort-fi');
const sort_en = document.getElementById('sort-en');
const tbody = document.querySelector('tbody');

const render = () => {
  switch (sort) {
    case 'name':
      filteredFoods.sort((a, b) => a[lang].localeCompare(b[lang]));
      break;
    case 'fs':
      filteredFoods.sort((a, b) => a.fiber / a.sugar - b.fiber / b.sugar);
      break;
    case 'ff':
      filteredFoods.sort((a, b) => a.fiber / a.fat - b.fiber / b.fat);
      break;
    case 'fe':
      filteredFoods.sort((a, b) => a.fiber / a.energy - b.fiber / b.energy);
      break;
  }

  tbody.replaceChildren();
  for (const food of filteredFoods) {
    const tr = document.createElement('tr');

    const name = document.createElement('td');
    name.textContent = food[lang].replace('/', ' / ');
    name.classList.toggle('left');
    const fs = document.createElement('td');
    fs.textContent =
      food.sugar === '0' ? '∞' : (food.fiber / food.sugar).toFixed(1);
    const ff = document.createElement('td');
    ff.textContent = (food.fiber / food.fat).toFixed(1);
    const fe = document.createElement('td');
    fe.textContent = ((food.fiber / food.energy) * 1000).toFixed(0);

    tr.appendChild(name);
    tr.appendChild(fs);
    tr.appendChild(ff);
    tr.appendChild(fe);

    tbody.appendChild(tr);
  }
};

toggle.addEventListener('click', () => {
  toggle.classList.toggle('active');
  if (toggle.classList.contains('active')) {
    filteredFoods = foods.filter(
      (food) => food.fiber / food.sugar >= 0.3 && food.fiber / food.fat >= 0.45,
    );
  } else {
    filteredFoods = foods;
  }
  render();
});

fi.addEventListener('click', () => {
  lang = 'fi';
  setTableHeaders();
  render();
});

en.addEventListener('click', () => {
  lang = 'en';
  setTableHeaders();
  render();
});

foodName.addEventListener('click', () => {
  sort = 'name';
  render();
});

fs.addEventListener('click', () => {
  sort = 'fs';
  render();
});

ff.addEventListener('click', () => {
  sort = 'ff';
  render();
});

fe.addEventListener('click', () => {
  sort = 'fe';
  render();
});

render();
