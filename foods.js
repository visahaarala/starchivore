const response = await fetch('./foods.tsv');

if (!response.ok) {
  throw new Error('Failed to load foods.tsv');
}

const tsv = await response.text();

const header = tsv.split('\n')[0].split('\t');

console.log(header.join('\n'));

const rows = tsv
  .split('\n')
  .slice(1)
  .map((row) => row.split('\t'));

const foods = [];
rows.forEach((row) => {
  foods.push({
    fi: row[header.indexOf('fi')],
    energy: row[header.indexOf('energy')],
    fat: row[header.indexOf('fat')],
    sugar: row[header.indexOf('sugar')],
    fiber: row[header.indexOf('fiber')],
    category: row[header.indexOf('category')],
  });
});

foods.sort((a, b) => a.fi.localeCompare(b.fi));

export default foods;
