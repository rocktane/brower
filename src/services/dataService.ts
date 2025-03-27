import { ref } from 'vue';
import Papa from 'papaparse';

// Google Sheet URL in CSV format
const GOOGLE_SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

// Interface for item data
export interface Item {
  name: string;
  code: string;
  brew: string;
  tap?: string;
  logo: string;
  category: string;
  url: string;
  description: string;     // Keep for backward compatibility
  descriptionEN: string;   // New field for English description
  descriptionFR: string;   // New field for French description
  special: string;
  checked?: boolean;
}

// Interface for the cached data structure
export interface CachedData {
  lastModified: string;
  items: Item[];
}

export const isLoading = ref(false);
export const error = ref<string | null>(null);

/**
 * Fetch the Last-Modified header from the Google Sheet
 */
export async function fetchLastModifiedDate(): Promise<string> {
  try {
    const response = await fetch(GOOGLE_SHEET_URL, { method: 'HEAD' });
    return response.headers.get('Last-Modified') || new Date().toISOString();
  } catch (err) {
    console.error('Error fetching last modified date:', err);
    return new Date().toISOString();
  }
}

/**
 * Parse CSV data into an array of items
 */
function parseCSVtoItems(csvData: string): Item[] {
  const { data } = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true
  });

  return data.map((row: any) => ({
    name: row.name || '',
    code: row.code || '',
    brew: row.brew || '',
    tap: row.tap || undefined,
    logo: row.logo || '',
    category: row.category || '',
    url: row.url || '',
    description: row.description || '', // Keep for backward compatibility
    descriptionEN: row.descriptionEN || row.description || '', // Use description as fallback
    descriptionFR: row.descriptionFR || row.description || '', // Use description as fallback
    special: row.special || 'none',
  }));
}

/**
 * Fetch data from Google Sheet and parse it
 */
export async function fetchDataFromGoogleSheet(): Promise<CachedData> {
  isLoading.value = true;
  error.value = null;

  try {
    // Get the last modified date
    const lastModified = await fetchLastModifiedDate();

    // Fetch the CSV data
    const response = await fetch(GOOGLE_SHEET_URL);
    const csvData = await response.text();

    // Parse the CSV data
    const items = parseCSVtoItems(csvData);

    return {
      lastModified,
      items
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching data:', errorMessage);
    error.value = errorMessage;
    throw err;
  } finally {
    isLoading.value = false;
  }
}

/**
 * Save data to local storage
 */
export function saveDataToLocalStorage(data: CachedData): void {
  localStorage.setItem('brower_data_cache', JSON.stringify(data));
}

/**
 * Load data from local storage
 */
export function loadDataFromLocalStorage(): CachedData | null {
  const cachedData = localStorage.getItem('brower_data_cache');
  return cachedData ? JSON.parse(cachedData) : null;
}

/**
 * Import data from db.json
 */
export async function importFromDBJson(): Promise<CachedData> {
  try {
    const module = await import('../db.json');
    // Add missing fields for backward compatibility
    const items = Array.isArray(module.default) ? module.default : [];

    // Ensure all items have the required fields
    const updatedItems = items.map((item: any) => ({
      ...item,
      descriptionEN: item.descriptionEN || item.description || '',
      descriptionFR: item.descriptionFR || item.description || '',
    }));

    return {
      lastModified: new Date().toISOString(),
      items: updatedItems
    };
  } catch (err) {
    console.error('Error importing from db.json:', err);
    throw err;
  }
}

/**
 * Check if data needs to be refreshed
 */
export async function checkForUpdates(): Promise<boolean> {
  const cachedData = loadDataFromLocalStorage();
  if (!cachedData) return true;

  try {
    const remoteLastModified = await fetchLastModifiedDate();

    // Parse dates to compare them properly
    const remoteDate = new Date(remoteLastModified).getTime();
    const cachedDate = new Date(cachedData.lastModified).getTime();

    // Add a 5-minute threshold to avoid frequent updates
    const fiveMinutesInMs = 5 * 60 * 1000;

    // Only update if the remote date is at least 5 minutes newer
    return remoteDate > (cachedDate + fiveMinutesInMs);
  } catch (err) {
    console.error('Error checking for updates:', err);
    return false;
  }
}

/**
 * Get data, either from cache or from Google Sheet
 */
export async function getData(): Promise<Item[]> {
  isLoading.value = true;

  try {
    // Try to load from localStorage first
    const cachedData = loadDataFromLocalStorage();

    // If no cache exists or needs refresh, fetch new data
    if (!cachedData || await checkForUpdates()) {
      // First try to fetch from Google Sheet
      try {
        const freshData = await fetchDataFromGoogleSheet();
        saveDataToLocalStorage(freshData);
        return freshData.items;
      } catch (err) {
        // If Google Sheet fails, fall back to db.json
        console.error('Failed to fetch from Google Sheet, falling back to db.json');
        const dbData = await importFromDBJson();
        saveDataToLocalStorage(dbData);
        return dbData.items;
      }
    }

    return cachedData.items;
  } finally {
    isLoading.value = false;
  }
}

/**
 * Initialize data service
 * This function should be called when the app starts
 * It will check if we need to refresh data and return the initial data
 */
export async function initializeDataService(): Promise<Item[]> {
  try {
    // Try to load from localStorage first
    const cachedData = loadDataFromLocalStorage();

    // If we have cached data, use it immediately
    if (cachedData && cachedData.items && cachedData.items.length > 0) {
      console.log('Using cached data from local storage');

      // Start a background check for updates
      setTimeout(async () => {
        try {
          const needsUpdate = await checkForUpdates();
          if (needsUpdate) {
            console.log('Background refresh started');
            fetchDataFromGoogleSheet().then(freshData => {
              saveDataToLocalStorage(freshData);
              console.log('Background data refresh complete');
            }).catch(err => {
              console.error('Background refresh failed:', err);
            });
          } else {
            console.log('Cached data is up to date');
          }
        } catch (err) {
          console.error('Failed to check for updates:', err);
        }
      }, 100); // Start background check very shortly after initial render

      return cachedData.items;
    }

    // If no cache or empty cache, try to load from db.json first for speed
    try {
      console.log('No valid cache, loading from db.json');
      const dbData = await importFromDBJson();

      // Start a background update from the Google Sheet
      setTimeout(async () => {
        try {
          console.log('Fetching latest data in background');
          const freshData = await fetchDataFromGoogleSheet();
          saveDataToLocalStorage(freshData);
          console.log('Updated with latest data from Google Sheet');
        } catch (err) {
          console.error('Background fetch failed:', err);
        }
      }, 100);

      return dbData.items;
    } catch (err) {
      // If db.json fails, fetch from Google Sheet directly
      console.error('Failed to load from db.json, fetching from Google Sheet:', err);
      const freshData = await fetchDataFromGoogleSheet();
      saveDataToLocalStorage(freshData);
      return freshData.items;
    }
  } catch (err) {
    console.error('Failed to initialize data service:', err);
    error.value = err instanceof Error ? err.message : 'Unknown error';

    // Try one last time with db.json as absolute fallback
    try {
      const dbData = await importFromDBJson();
      return dbData.items;
    } catch (fallbackErr) {
      console.error('All data sources failed:', fallbackErr);
      return []; // Return empty array as last resort
    }
  }
}
