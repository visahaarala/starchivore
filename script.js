//
// load foods

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
  const rows = lines
    .slice(1)
    .map((row) => row.split(/\t/));

  rows.forEach((row) => {
    foods.push({
      fi: capitalize(row[header.indexOf('fi')]),
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

const nimi = document.querySelector('#nimi');
const kuitusokeri = document.querySelector('#kuitusokeri');
const kuiturasva = document.querySelector('#kuiturasva');
const kuituenergia = document.querySelector('#kuituenergia');

const rows = document.querySelector('#rows');

const render = () => {
  rows.replaceChildren();

  for (const food of foods) {
    const row = document.createElement('tr');

    const nimi = document.createElement('td');
    nimi.textContent = food.fi.replace('/', ' / ');
    row.appendChild(nimi);

    const fs = document.createElement('td');
    fs.textContent =
      food.sugar === '0' ? '∞' : (food.fiber / food.sugar).toFixed(1);
    row.appendChild(fs);

    const ff = document.createElement('td');
    ff.textContent = (food.fiber / food.fat).toFixed(1);
    row.appendChild(ff);

    const fe = document.createElement('td');
    fe.textContent = ((food.fiber / food.energy) * 1000).toFixed(0);
    row.appendChild(fe);

    rows.appendChild(row);
  }
};

nimi.addEventListener('click', () => {
  foods.sort((a, b) => a.fi.localeCompare(b.fi));
  render();
});

kuitusokeri.addEventListener('click', () => {
  foods.sort((a, b) => a.fiber / a.sugar - b.fiber / b.sugar);
  render();
});

kuiturasva.addEventListener('click', () => {
  foods.sort((a, b) => a.fiber / a.fat - b.fiber / b.fat);
  render();
});

kuituenergia.addEventListener('click', () => {
  foods.sort((a, b) => a.fiber / a.energy - b.fiber / b.energy);
  render();
});

render();
