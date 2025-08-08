/**
 * Lightweight CSV parser for Node.js scripts
 */

export function parseCSV(csvText) {
  const errors = [];
  const data = [];
  
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
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      data.push(row);
    }
  } catch (err) {
    errors.push(err);
  }
  
  return { data, errors };
}

function parseCSVLine(line) {
  const result = [];
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