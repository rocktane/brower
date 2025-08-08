import { ref } from 'vue';
import Papa from 'papaparse';

// Google Sheet URL in CSV format
const GOOGLE_SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

// Direct import of db.json data for bundling at build time
import defaultData from '../db.json';

// Interface for item data
export interface Item {
  name: string;
  code: string;
  brew: string;
  tap?: string;
  logo: string;
  category: string;
  url: string;
  descriptionEN: string;
  descriptionFR: string;
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
export const dataSource = ref<string>('unknown');
export const lastUpdated = ref<string | null>(null);

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
 * Validate a single item to ensure it has required fields
 */
function validateItem(item: any): boolean {
  // Required fields that must have non-empty values
  const requiredFields = ['name', 'code', 'brew', 'category'];
  
  for (const field of requiredFields) {
    if (!item[field] || typeof item[field] !== 'string' || item[field].trim() === '') {
      console.warn(`Invalid item: missing or empty ${field}`, item);
      return false;
    }
  }
  
  return true;
}

/**
 * Parse CSV data into an array of items with validation
 */
function parseCSVtoItems(csvData: string): Item[] {
  const { data, errors } = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true
  });

  if (errors && errors.length > 0) {
    console.error('CSV parsing errors:', errors);
  }

  const validItems: Item[] = [];
  let invalidCount = 0;

  for (const row of data as any[]) {
    if (validateItem(row)) {
      validItems.push({
        name: row.name.trim(),
        code: row.code.trim(),
        brew: row.brew.trim(),
        tap: row.tap?.trim() || undefined,
        logo: row.logo?.trim() || '',
        category: row.category.trim(),
        url: row.url?.trim() || '',
        descriptionEN: row.descriptionEN?.trim() || '',
        descriptionFR: row.descriptionFR?.trim() || '',
        special: row.special?.trim() || 'none',
      });
    } else {
      invalidCount++;
    }
  }

  if (invalidCount > 0) {
    console.warn(`Filtered out ${invalidCount} invalid items from CSV data`);
  }

  console.log(`Successfully parsed ${validItems.length} valid items from CSV`);
  return validItems;
}

/**
 * Try multiple URL formats to fetch Google Sheet data
 */
async function tryFetchGoogleSheet(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'text/csv, text/plain, */*'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Fetch data from Google Sheet and parse it with validation
 */
export async function fetchDataFromGoogleSheet(): Promise<CachedData> {
  isLoading.value = true;
  error.value = null;

  try {
    if (!GOOGLE_SHEET_URL) {
      throw new Error('Google Sheet URL not configured. Please set VITE_GOOGLE_SHEET_URL environment variable.');
    }

    console.log('Fetching data from Google Sheet...');
    
    // Get the last modified date
    const lastModified = await fetchLastModifiedDate();

    // Try to fetch CSV data
    let csvData = '';
    let fetchError = null;
    
    try {
      csvData = await tryFetchGoogleSheet(GOOGLE_SHEET_URL);
    } catch (err) {
      fetchError = err;
      console.warn('Primary URL failed, trying alternative format...');
      
      // Try alternative URL format if the primary fails
      const sheetId = GOOGLE_SHEET_URL.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (sheetId) {
        const altUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        try {
          csvData = await tryFetchGoogleSheet(altUrl);
          console.log('Alternative URL format worked!');
        } catch (altErr) {
          // If both fail, throw the original error
          throw fetchError;
        }
      } else {
        throw fetchError;
      }
    }
    
    // Check if we got valid CSV data
    if (!csvData || csvData.trim().length === 0) {
      throw new Error('Received empty data from Google Sheet');
    }

    // Check if we accidentally got HTML instead of CSV
    if (csvData.trim().startsWith('<!DOCTYPE') || csvData.trim().startsWith('<html')) {
      console.error('Received HTML instead of CSV. This is likely a CORS/redirect issue.');
      console.error('Current URL:', GOOGLE_SHEET_URL);
      console.error('Try one of these solutions:');
      console.error('1. Clear your browser cache and cookies for docs.google.com');
      console.error('2. Open the URL directly in a new tab to accept any redirects:', GOOGLE_SHEET_URL);
      console.error('3. Use a proxy service or backend server to fetch the data');
      throw new Error('Google Sheet returned HTML (likely due to CORS/redirect). See console for solutions.');
    }

    // Check if the response looks like CSV (has comma-separated values)
    if (!csvData.includes(',') || !csvData.includes('\n')) {
      console.warn('Response may not be valid CSV format');
    }

    // Parse the CSV data with validation
    const items = parseCSVtoItems(csvData);

    // Validate we got at least some items
    if (items.length === 0) {
      throw new Error('No valid items found in Google Sheet data');
    }

    console.log(`Successfully fetched ${items.length} items from Google Sheet`);

    return {
      lastModified,
      items
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    // Log specific error types
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        console.error('Google Sheet fetch timeout after 10 seconds');
        error.value = 'Request timeout - Google Sheet took too long to respond';
      } else if (err.message.includes('fetch')) {
        console.error('Network error fetching Google Sheet:', errorMessage);
        error.value = 'Network error - Could not reach Google Sheet';
      } else {
        console.error('Error fetching data from Google Sheet:', errorMessage);
        error.value = errorMessage;
      }
    }
    
    throw err;
  } finally {
    isLoading.value = false;
  }
}

/**
 * Save data to local storage
 */
export function saveDataToLocalStorage(data: CachedData): void {
  try {
    localStorage.setItem('brower_data_cache', JSON.stringify(data));
    console.log('Data successfully saved to local storage');
  } catch (err) {
    console.error('Failed to save data to local storage:', err);
    // Don't throw - just log the error as we can still function without storage
  }
}

/**
 * Load data from local storage with validation
 */
export function loadDataFromLocalStorage(): CachedData | null {
  try {
    const cachedData = localStorage.getItem('brower_data_cache');
    if (!cachedData) {
      console.log('No cached data found in localStorage');
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    
    // Validate the data structure
    if (!parsedData.items || !Array.isArray(parsedData.items)) {
      console.warn('Invalid data structure in local storage - missing or invalid items array');
      localStorage.removeItem('brower_data_cache'); // Clear invalid cache
      return null;
    }

    // Validate that items have required fields
    const validItems = parsedData.items.filter((item: any) => validateItem(item));
    
    if (validItems.length === 0) {
      console.warn('No valid items in cached data');
      localStorage.removeItem('brower_data_cache'); // Clear invalid cache
      return null;
    }

    if (validItems.length < parsedData.items.length) {
      console.warn(`Filtered out ${parsedData.items.length - validItems.length} invalid items from cache`);
      parsedData.items = validItems;
    }

    console.log(`Loaded ${validItems.length} valid items from localStorage cache`);
    return parsedData;
  } catch (err) {
    console.error('Error loading data from local storage:', err);
    // Clear corrupted cache
    try {
      localStorage.removeItem('brower_data_cache');
      console.log('Cleared corrupted cache from localStorage');
    } catch (clearErr) {
      console.error('Failed to clear corrupted cache:', clearErr);
    }
    return null;
  }
}

/**
 * Import data from db.json with validation
 */
export async function importFromDBJson(): Promise<CachedData> {
  try {
    let items: any[];

    // In production, use the directly imported data
    if (import.meta.env.PROD) {
      items = defaultData;
    } else {
      // In development, try to dynamically import for fresher data
      try {
        const response = await fetch('/src/db.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        items = await response.json();
      } catch (srcFetchErr) {
        // Try fallback to public folder
        try {
          const publicResponse = await fetch('/db.json');
          if (!publicResponse.ok) {
            throw new Error(`Failed to fetch: ${publicResponse.status}`);
          }
          items = await publicResponse.json();
        } catch (publicFetchErr) {
          items = defaultData;
        }
      }
    }

    // Validate that we have an array
    if (!Array.isArray(items)) {
      console.error('db.json does not contain an array of items');
      throw new Error('Invalid db.json format - expected array');
    }

    // Filter and validate items
    const validItems: Item[] = [];
    let invalidCount = 0;

    for (const item of items) {
      if (validateItem(item)) {
        validItems.push({
          name: item.name.trim(),
          code: item.code.trim(),
          brew: item.brew.trim(),
          tap: item.tap?.trim() || undefined,
          logo: item.logo?.trim() || '',
          category: item.category.trim(),
          url: item.url?.trim() || '',
          descriptionEN: item.descriptionEN?.trim() || '',
          descriptionFR: item.descriptionFR?.trim() || '',
          special: item.special?.trim() || 'none',
        });
      } else {
        invalidCount++;
      }
    }

    if (invalidCount > 0) {
      console.warn(`Filtered out ${invalidCount} invalid items from db.json`);
    }

    if (validItems.length === 0) {
      throw new Error('No valid items found in db.json');
    }

    return {
      lastModified: new Date().toISOString(),
      items: validItems
    };
  } catch (err) {
    console.error('Error importing from db.json:', err);
    
    // Last resort: try to use bundled data with validation
    try {
      const fallbackItems: Item[] = [];
      
      if (Array.isArray(defaultData)) {
        for (const item of defaultData) {
          if (validateItem(item)) {
            fallbackItems.push({
              name: item.name.trim(),
              code: item.code.trim(),
              brew: item.brew.trim(),
              tap: item.tap?.trim() || undefined,
              logo: item.logo?.trim() || '',
              category: item.category.trim(),
              url: item.url?.trim() || '',
              descriptionEN: item.descriptionEN?.trim() || '',
              descriptionFR: item.descriptionFR?.trim() || '',
              special: item.special?.trim() || 'none',
            });
          }
        }
      }

      if (fallbackItems.length > 0) {
        console.log(`Using ${fallbackItems.length} valid items from bundled fallback data`);
        return {
          lastModified: new Date().toISOString(),
          items: fallbackItems
        };
      }
    } catch (fallbackErr) {
      console.error('Failed to process bundled fallback data:', fallbackErr);
    }

    // If all else fails, return empty array
    console.error('All data sources failed - returning empty dataset');
    return {
      lastModified: new Date().toISOString(),
      items: []
    };
  }
}

/**
 * Check if data needs to be refreshed
 */
export async function checkForUpdates(forceCheck: boolean = false): Promise<boolean> {
  const cachedData = loadDataFromLocalStorage();
  if (!cachedData) return true;

  // Force refresh if explicitly requested
  if (forceCheck) {
    console.log('Force refresh requested');
    return true;
  }

  try {
    const remoteLastModified = await fetchLastModifiedDate();

    // Parse dates to compare them properly
    const remoteDate = new Date(remoteLastModified).getTime();
    const cachedDate = new Date(cachedData.lastModified).getTime();

    // Check cache age - if older than 1 hour, refresh
    const oneHourInMs = 60 * 60 * 1000;
    const cacheAge = Date.now() - cachedDate;
    
    if (cacheAge > oneHourInMs) {
      console.log('Cache is older than 1 hour, refreshing...');
      return true;
    }

    // Check if remote has newer data
    const hasUpdate = remoteDate > cachedDate;
    if (hasUpdate) {
      console.log('Google Sheet has newer data, refreshing...');
    }
    
    return hasUpdate;
  } catch (err) {
    console.error('Error checking for updates:', err);
    // On error, try to refresh to get latest data
    return true;
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
 * Clear local storage cache
 */
export function clearCache(): void {
  try {
    localStorage.removeItem('brower_data_cache');
    console.log('Cache cleared successfully');
  } catch (err) {
    console.error('Failed to clear cache:', err);
  }
}


/**
 * Force refresh data from Google Sheet
 */
export async function forceRefreshData(): Promise<Item[]> {
  try {
    const freshData = await fetchDataFromGoogleSheet();
    saveDataToLocalStorage(freshData);
    dataSource.value = 'Google Sheet (forced refresh)';
    lastUpdated.value = new Date().toISOString();
    return freshData.items;
  } catch (err) {
    const dbData = await importFromDBJson();
    saveDataToLocalStorage(dbData);
    dataSource.value = 'db.json (fallback)';
    lastUpdated.value = new Date().toISOString();
    return dbData.items;
  }
}

/**
 * Initialize data service
 * This function should be called when the app starts
 * It will check if we need to refresh data and return the initial data
 */
export async function initializeDataService(): Promise<Item[]> {
  // Track our initial data source for analytics and debugging
  let initialDataSource = 'unknown';
  let initialData: Item[] = [];

  try {
    // Try to load from localStorage first
    const cachedData = loadDataFromLocalStorage();

    // If we have cached data, use it for immediate display
    if (cachedData && cachedData.items && cachedData.items.length > 0) {
      initialDataSource = 'localStorage (cached)';
      initialData = cachedData.items;
      dataSource.value = initialDataSource;
      lastUpdated.value = cachedData.lastModified;

      // Always check for updates in the background
      setTimeout(async () => {
        try {
          const needsUpdate = await checkForUpdates();
          if (needsUpdate) {
            const freshData = await fetchDataFromGoogleSheet();
            if (freshData.items && freshData.items.length > 0) {
              saveDataToLocalStorage(freshData);
              dataSource.value = 'Google Sheet (updated)';
              lastUpdated.value = freshData.lastModified;
              // Don't trigger reload - just log the update
            }
          } else {
          }
        } catch (err) {
        }
      }, 1000); // Check after 1 second

      return initialData;
    }

    // If no cache or empty cache, try to load from db.json first for speed
    try {
      const dbData = await importFromDBJson();
      initialDataSource = 'db.json';
      initialData = dbData.items;

      // Save immediately to localStorage to prevent future issues
      if (dbData.items && dbData.items.length > 0) {
        saveDataToLocalStorage(dbData);
      }

      // Always try to get fresh data from Google Sheet in background
      setTimeout(async () => {
        try {
          const freshData = await fetchDataFromGoogleSheet();

          // Only save if we got valid data
          if (freshData.items && freshData.items.length > 0) {
            saveDataToLocalStorage(freshData);
            dataSource.value = 'Google Sheet (background update)';
            lastUpdated.value = freshData.lastModified;
            // Don't trigger reload - just log the update
          } else {
          }
        } catch (err) {
          // Keep using db.json data
          dataSource.value = 'db.json (Google Sheet unavailable)';
        }
      }, 2000); // Try after 2 seconds

      return initialData;
    } catch (err) {
      // If db.json fails, fetch from Google Sheet directly
      const freshData = await fetchDataFromGoogleSheet();
      initialDataSource = 'googleSheet';
      initialData = freshData.items;

      if (freshData.items && freshData.items.length > 0) {
        saveDataToLocalStorage(freshData);
      }

      return initialData;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error';

    // Try one last time with db.json as absolute fallback
    try {
      const dbData = await importFromDBJson();
      initialDataSource = 'fallback-db.json';
      initialData = dbData.items;
      return initialData;
    } catch (fallbackErr) {
      return []; // Return empty array as last resort
    }
  } finally {
    // Update reactive refs
    if (!dataSource.value || dataSource.value === 'unknown') {
      dataSource.value = initialDataSource;
    }
    if (!lastUpdated.value) {
      lastUpdated.value = new Date().toISOString();
    }
  }
}
