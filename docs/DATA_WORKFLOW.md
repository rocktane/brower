# Data Workflow Documentation

## Overview

Brower uses a sophisticated multi-tier data fetching system with validation, caching, and fallback mechanisms to ensure reliable access to application data.

## Data Sources

### 1. Google Sheets (Primary Source)
- **URL**: Configured via `VITE_GOOGLE_SHEET_URL` environment variable
- **Format**: CSV export from Google Sheets
- **Purpose**: Live data management without code deployment
- **Access**: Direct HTTP fetch with 10-second timeout

### 2. Local Storage Cache
- **Key**: `brower_data_cache`
- **Purpose**: Reduce API calls and provide offline capability
- **Validation**: Automatic cleanup of corrupted/invalid cache

### 3. db.json (Fallback)
- **Location**: `/src/db.json` (bundled at build time)
- **Purpose**: Guaranteed data availability even when Google Sheets is unreachable
- **Usage**: Primary fallback and initial data source in production

## Data Flow Diagram

```
┌─────────────────┐
│   User Opens    │
│   Application   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check LocalStorage│
│     Cache        │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Valid?  │──No──┐
    └────┬────┘      │
         │Yes        │
         ▼           │
┌─────────────────┐  │
│  Return Cached  │  │
│      Data       │  │
└────────┬────────┘  │
         │           │
         │           ▼
         │  ┌──────────────┐
         │  │ Load db.json │
         │  │  (Immediate) │
         │  └──────┬───────┘
         │         │
         ▼         ▼
┌─────────────────────────┐
│   Background Update     │
│  (Dev Mode Only)        │
├─────────────────────────┤
│ 1. Fetch Google Sheet   │
│ 2. Validate Data        │
│ 3. Update Cache         │
└─────────────────────────┘
```

## Data Validation

### Required Fields
Each item must have these non-empty fields:
- `name`: Application name
- `code`: Unique identifier
- `brew`: Homebrew formula name
- `category`: Application category

### Optional Fields
- `tap`: Homebrew tap (if needed)
- `logo`: Logo URL/path
- `url`: Application website
- `descriptionEN`: English description
- `descriptionFR`: French description
- `special`: Special flag (default: "none")

### Validation Process
1. **CSV Parsing**: Validates CSV structure and handles parsing errors
2. **Field Validation**: Checks required fields are present and non-empty
3. **Data Cleaning**: Trims whitespace from all string fields
4. **Invalid Item Filtering**: Removes items that fail validation
5. **Minimum Data Check**: Ensures at least one valid item exists

## Error Handling

### Network Errors
- **Timeout**: 10-second timeout for Google Sheets fetch
- **Fallback**: Automatic fallback to db.json
- **Logging**: Detailed error logging for debugging

### Data Errors
- **Empty Response**: Detected and handled with fallback
- **Invalid Format**: CSV format validation
- **Corrupted Cache**: Automatic cache cleanup
- **Missing Fields**: Items filtered out with warnings

## Caching Strategy

### Cache Storage
- **Format**: JSON with timestamp and items array
- **Location**: Browser localStorage
- **Key**: `brower_data_cache`

### Cache Validation
```javascript
{
  "lastModified": "2024-01-15T10:30:00Z",
  "items": [
    {
      "name": "Visual Studio Code",
      "code": "vscode",
      "brew": "visual-studio-code",
      "category": "Development",
      // ... other fields
    }
  ]
}
```

### Cache Refresh Logic
1. Check if cache exists and is valid
2. Compare cache timestamp with Google Sheets Last-Modified header
3. Apply 5-minute threshold to prevent excessive updates
4. Background refresh in development mode only

## Environment-Specific Behavior

### Development Mode
1. Loads db.json immediately for fast startup
2. Performs background Google Sheets fetch after 3 seconds
3. Updates cache with fresh data if available
4. Allows dynamic reloading of db.json

### Production Mode
1. Uses pre-bundled db.json data
2. Skips background refresh to avoid runtime issues
3. Relies on build-time data bundling
4. Optimized for stability over freshness

## Google Sheets Setup

### Sheet Structure
The Google Sheet must have these column headers:
- `name` (required)
- `code` (required)
- `brew` (required)
- `category` (required)
- `tap` (optional)
- `logo` (optional)
- `url` (optional)
- `descriptionEN` (optional)
- `descriptionFR` (optional)
- `special` (optional)

### Publishing Settings
1. Share the sheet with "Anyone with the link can view"
2. Use the CSV export URL format (IMPORTANT: Must use `/export?format=csv`):
   ```
   https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv
   ```
   Or if you have multiple tabs and need a specific one:
   ```
   https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={TAB_ID}
   ```
3. Set the URL in `.env` file:
   ```
   VITE_GOOGLE_SHEET_URL='https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv'
   ```

⚠️ **Common Mistake**: Using `/gviz/tq?tqx=out:csv` will return HTML instead of CSV!

## Updating Data

### Via Google Sheets (Recommended)
1. Edit the Google Sheet directly
2. Changes are live immediately
3. Users get updates on next page load (with cache validation)
4. No code deployment required

### Via db.json (Fallback Update)
1. Run `npm run update-db` to fetch latest from Google Sheets
2. Commit the updated `db.json` file
3. Deploy the application
4. Used when Google Sheets structure changes

## Monitoring and Debugging

### Console Logs
The data service provides detailed logging:
- Data source identification
- Item count and validation results
- Error details with specific causes
- Cache operations status

### Key Log Messages
```
✓ "Successfully parsed X valid items from CSV"
✓ "Loaded X valid items from localStorage cache"
✓ "Successfully fetched X items from Google Sheet"
⚠ "Filtered out X invalid items from CSV data"
⚠ "No valid items in cached data"
✗ "Failed to fetch Google Sheet: [error]"
✗ "No valid items found in Google Sheet data"
```

### Debugging Steps
1. Check browser console for error messages
2. Verify `VITE_GOOGLE_SHEET_URL` is set correctly
3. Test Google Sheet URL directly in browser
4. Clear localStorage cache if corrupted
5. Check db.json has valid data structure

## Best Practices

### For Developers
1. Always test with both Google Sheets and db.json fallback
2. Monitor console logs during development
3. Keep db.json updated as backup
4. Test offline scenarios

### For Content Managers
1. Validate data in Google Sheets before saving
2. Ensure required fields are never empty
3. Use consistent naming for categories
4. Test changes in development environment first

## Security Considerations

1. **Public Data Only**: Google Sheets must contain only public information
2. **No Sensitive Data**: Never include API keys, passwords, or private data
3. **URL Protection**: Keep Google Sheet URL in environment variables
4. **Validation**: All data is validated before use
5. **Sanitization**: All strings are trimmed and sanitized

## Troubleshooting

### Common Issues

#### "No data available"
- Check internet connection
- Verify Google Sheets URL is correct
- Check browser console for errors
- Clear localStorage and reload

#### "Data not updating"
- Cache may not be expired (5-minute threshold)
- Clear localStorage manually
- Check Google Sheets Last-Modified header
- Verify production vs development mode

#### "Invalid items filtered"
- Check Google Sheets for empty required fields
- Verify column headers match expected names
- Look for special characters or formatting issues

#### "Network timeout"
- Google Sheets may be slow or unavailable
- Fallback to db.json should activate
- Check internet connection stability