import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Chemin vers votre fichier JSON original
const inputFilePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "src/sorted-db.json"
);
// Chemin vers votre fichier JSON trié
const outputFilePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "src/sorted-db.json"
);

// Lire les données du fichier JSON
const data = await readFile(inputFilePath, "utf-8");
const items = JSON.parse(data);

// Trier les items par catégorie, puis par nom
items.sort((a, b) => {
  if (a.category < b.category) return -1;
  if (a.category > b.category) return 1;
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
});

// Écrire les données triées dans un nouveau fichier
await writeFile(outputFilePath, JSON.stringify(items, null, 2), "utf-8");

// Pour lancer le script, exécutez la commande suivante :
// node sortdB.js
// ou ajouter ' "sort-data": "node sortDb.js", ' à votre package.json et exécuter la commande :
// node sort-data
