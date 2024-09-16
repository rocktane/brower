import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const filePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "src/db.json"
);

const data = await readFile(filePath, "utf-8");
const items = JSON.parse(data);

// Sort by category, then by name
items.sort((a, b) => {
  if (a.category < b.category) return -1;
  if (a.category > b.category) return 1;
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
});

await writeFile(filePath, JSON.stringify(items, null, 2), "utf-8");

// To execute the script, run the following command:
// node sortdB.js
// or add ' "sort-data": "node sortDb.js", ' to package.json and run the command:
// node sort-data
