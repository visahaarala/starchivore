console.log('manipulating data..');
import { readFileSync, writeFileSync } from 'fs';

type Food = {
  id: string;
  fi: string;
  en: string;
  category: string;
  raw: boolean;
  energy: number; // kj
  fat: number; // g
  sugar: number; // g
  fiber: number; // g
  scientific?: string;
};

const loadCsv = (filename: string) => {
  const data = readFileSync(new URL(filename, import.meta.url), {
    encoding: 'utf8',
  }).trim();
  const header: string[] = data.trim().split('\n')[0].trim().split(';');
  const rows: string[][] = [];
  for (const row of data.trim().split('\n').slice(1)) {
    rows.push(row.trim().split(';'));
  }
  return { header, rows };
};

//
// LOAD CSV FILES
//

// food ID, name, PROCESS & IGCLASS
const foodCsv = loadCsv('./csv/food.csv');
// component values
const compValueCsv = loadCsv('./csv/component_value.csv');
// english names
const enCsv = loadCsv('./csv/foodname_EN.csv');
// scientific names
const txCsv = loadCsv('./csv/foodname_TX.csv');
// categories
const igClassCsv = loadCsv('./csv/igclass_FI.csv');

//
// CREATE FOOD OBJECTS
//
const foods: Food[] = [];
let id: string | undefined = undefined;
let food: Partial<Food> = {};
compValueCsv.rows.forEach((row) => {
  const newId = row[0];
  if (newId !== id) {
    // check if food has all data and push to foods[]
    if (
      food.id !== undefined &&
      food.fi !== undefined &&
      food.en !== undefined &&
      !food.fi.toLowerCase().includes('(arc)') &&
      food.category !== undefined &&
      food.energy !== undefined &&
      food.raw !== undefined &&
      food.fiber !== undefined &&
      food.fat !== undefined &&
      food.sugar !== undefined
      // food.scientific may be undefined
    ) {
      foods.push(food as Food);
    }

    // create new food object
    id = newId;
    food = { id };

    // add scientific name
    const txCsvRow = txCsv.rows.find((row) => row[0] === String(id));
    if (txCsvRow) {
      food.scientific = txCsvRow[1];
    }

    // add english name
    const enCsvRow = enCsv.rows.find((row) => row[0] === String(id));
    if (enCsvRow) {
      food.en = enCsvRow[1];
    }

    // add name, process & igclass (category)
    const foodCsvRow = foodCsv.rows.find((row) => row[0] === String(id));
    if (foodCsvRow) {
      food.fi = foodCsvRow[1];
      food.raw = foodCsvRow[3] === 'RAW';

      // category
      const igClass = foodCsvRow[6];
      food.category = igClassCsv.rows.find((row) => row[0] === igClass)![1];
    }
  }
  if (row[1] === 'ENERC') {
    food.energy = Number(row[2].replace(',', '.')) / 4.184; // joules to calories
  }
  if (row[1] === 'SUGAR') {
    food.sugar = Number(row[2].replace(',', '.'));
  }
  if (row[1] === 'FAT') {
    food.fat = Number(row[2].replace(',', '.'));
  }
  if (row[1] === 'FIBC') {
    food.fiber = Number(row[2].replace(',', '.'));
  }
});

//
// FILTER FOODS
//
const filteredFoods = foods.filter((food) => {
  if (!food.scientific) return false;
  if (!food.raw) return false;
  if (food.fiber === 0) return false;
  return true;
});

//
// WRITE foods.tsv
//
const header = Object.keys(filteredFoods.find((food) => food.scientific)!);
console.log(header);
const rows = filteredFoods.map((food) =>
  header.map((key) => food[key as keyof Food]),
);
const foodsTsv =
  header.join('\t') + '\n' + rows.map((row) => row.join('\t')).join('\n');
writeFileSync(new URL('../foods.tsv', import.meta.url), foodsTsv);
