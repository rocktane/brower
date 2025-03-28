#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Sheet URL in CSV format
const GOOGLE_SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;
const DB_PATH = path.resolve(__dirname, '../src/db.json');
const CACHED_DB_PATH = path.resolve(__dirname, '../src/db.cache.json');

/**
 * Fetch the last modified date from the Google Sheet
 */
function fetchLastModifiedDate() {
  return new Promise((resolve, reject) => {
    const req = https.request(GOOGLE_SHEET_URL, { method: 'HEAD' }, (res) => {
      const lastModified = res.headers['last-modified'] || new Date().toISOString();
      resolve(lastModified);
    });

    req.on('error', (error) => {
      console.error('Error fetching last modified date:', error);
      reject(error);
    });

    req.end();
  });
}

/**
 * Fetch data from Google Sheet
 */
function fetchDataFromGoogleSheet() {
  return new Promise((resolve, reject) => {
    let data = '';

    const req = https.get(GOOGLE_SHEET_URL, (res) => {
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (error) => {
      console.error('Error fetching data:', error);
      reject(error);
    });

    req.end();
  });
}

/**
 * Parse CSV data into an array of items
 */
function parseCSVtoItems(csvData) {
  const { data } = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true
  });

  return data.map((row) => ({
    name: row.name || '',
    code: row.code || '',
    brew: row.brew || '',
    tap: row.tap || undefined,
    logo: row.logo || '',
    category: row.category || '',
    url: row.url || '',
    description: row.description || '',
    descriptionEN: row.descriptionEN || row.description || '',
    descriptionFR: row.descriptionFR || row.description || '',
    special: row.special || 'none',
  }));
}

/**
 * Save cached data to separate file
 */
function saveCachedData(items, lastModified) {
  const cachedData = {
    lastModified,
    items
  };

  fs.writeFileSync(CACHED_DB_PATH, JSON.stringify(cachedData, null, 2));
  console.log(`Cache file updated with last modified date: ${lastModified}`);
}

/**
 * Main function to update the db.json file
 */
async function updateDb() {
  try {
    // Get the last modified date
    const lastModified = await fetchLastModifiedDate();

    // Check if we have a cache file
    let shouldUpdate = true;
    if (fs.existsSync(CACHED_DB_PATH)) {
      const cachedData = JSON.parse(fs.readFileSync(CACHED_DB_PATH, 'utf8'));
      if (cachedData.lastModified === lastModified) {
        console.log('Data is up-to-date, no update needed.');
        shouldUpdate = false;
      }
    }

    if (shouldUpdate) {
      console.log('Fetching data from Google Sheet...');
      const csvData = await fetchDataFromGoogleSheet();
      const items = parseCSVtoItems(csvData);

      // Save items to db.json
      fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2));
      console.log(`db.json updated with ${items.length} items`);

      // Save to cache with last modified date
      saveCachedData(items, lastModified);
    }

  } catch (error) {
    console.error('Error updating db.json:', error);
    process.exit(1);
  }
}

// Run the update
updateDb();
