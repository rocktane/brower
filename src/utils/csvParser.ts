/**
 * Lightweight CSV parser to replace PapaParse
 * Reduces bundle size significantly
 */

export interface ParseResult {
  data: any[];
  errors: Error[];
}

export function parseCSV(csvText: string): ParseResult {
  const errors: Error[] = [];
  const data: any[] = [];
  
  try {
    // Split into lines and filter out empty ones
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return { data: [], errors: [] };
    }
    
    // Parse headers
    const headers = parseCSVLine(lines[0]);
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length !== headers.length) {
        errors.push(new Error(`Row ${i + 1}: Column count mismatch`));
        continue;
      }
      
      // Create object from headers and values
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      data.push(row);
    }
  } catch (err) {
    errors.push(err as Error);
  }
  
  return { data, errors };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Don't forget the last field
  result.push(current.trim());
  
  return result;
}