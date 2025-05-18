
import type { SeatingChartData, Table as TableType, Guest } from '@/types/seating';

/**
 * Parses a CSV string containing guest names and their assigned tables.
 * Expected CSV format:
 * Name,Table
 * "John Doe","Table 1"
 * "Jane Smith","Table 2"
 * ...
 * Headers are optional. Lines with insufficient columns or empty names/tables are skipped.
 * @param csvString The CSV content as a string.
 * @returns A SeatingChartData object or null if parsing fails or yields no data.
 */
export function parseSeatingChartCsv(csvString: string): SeatingChartData | null {
  try {
    const lines = csvString.trim().split('\n');
    if (lines.length === 0) return null;

    const guestTableMap = new Map<string, Guest[]>();
    let guestIdCounter = 0;

    // Check for headers and skip if present
    const firstLineLower = lines[0].toLowerCase();
    const startIndex = (firstLineLower.includes('name') && firstLineLower.includes('table')) ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const parts = line.split(',').map(part => part.trim().replace(/^"|"$/g, '')); // Trim and remove quotes

      if (parts.length < 2) {
        console.warn(`Skipping invalid CSV line (not enough columns): ${line}`);
        continue;
      }
      const guestName = parts[0];
      const tableName = parts[1];

      if (!guestName || !tableName) {
        console.warn(`Skipping line with empty name or table: ${line}`);
        continue;
      }

      if (!guestTableMap.has(tableName)) {
        guestTableMap.set(tableName, []);
      }
      guestTableMap.get(tableName)!.push({
        id: `csv-guest-${guestIdCounter++}-${Date.now()}`, // Generate a unique ID
        name: guestName,
      });
    }

    if (guestTableMap.size === 0) {
        console.warn("CSV parsing resulted in no valid table data.");
        return null;
    }

    const tables: TableType[] = [];
    let tableIdCounter = 0;
    for (const [tableName, guests] of guestTableMap.entries()) {
      tables.push({
        id: `csv-table-${tableIdCounter++}-${Date.now()}`, // Generate a unique ID
        name: tableName,
        guests: guests, // Guests will be sorted by sortTableData later if needed
      });
    }
    return { tables };
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return null;
  }
}

/**
 * Sorts seating chart data. Guests within each table are sorted alphabetically.
 * Tables are sorted by name, prioritizing numerical sorting for names like "Table 1", "Table 10".
 * @param chartData The SeatingChartData to sort.
 * @returns A new SeatingChartData object with sorted tables and guests.
 */
export const sortTableData = (chartData: SeatingChartData): SeatingChartData => {
  const sortedTables = chartData.tables.map(table => ({
    ...table,
    // Sort guests alphabetically within each table
    guests: [...table.guests].sort((a, b) => a.name.localeCompare(b.name))
  })).sort((a, b) => {
    // Helper to extract prefix and number from table names for robust sorting
    const extractDetails = (name: string): { prefix: string, num: number | null } => {
      const patternMatch = name.match(/^([a-zA-Z\s.'-]+?)(\d+)$/i); // Prefix (letters, spaces, dots, apostrophes, hyphens) followed by number
      if (patternMatch && patternMatch[1] && patternMatch[2]) {
        return { prefix: patternMatch[1].trim(), num: parseInt(patternMatch[2], 10) };
      }
      const pureNumericMatch = name.match(/^(\d+)$/); // Purely numeric name
      if (pureNumericMatch) {
        return { prefix: "", num: parseInt(pureNumericMatch[1], 10) };
      }
      return { prefix: name.trim(), num: null }; // No number or complex name, treat whole as prefix
    };

    const detailsA = extractDetails(a.name);
    const detailsB = extractDetails(b.name);

    // Primary sort: by prefix (case-insensitive)
    const prefixCompare = detailsA.prefix.toLowerCase().localeCompare(detailsB.prefix.toLowerCase());
    if (prefixCompare !== 0) {
      return prefixCompare;
    }

    // Secondary sort: by number (if prefixes are the same and both have numbers)
    if (detailsA.num !== null && detailsB.num !== null) {
      return detailsA.num - detailsB.num;
    }
    
    // Tertiary sort: tables with numbers before those without (if prefixes are same)
    if (detailsA.num !== null) return -1; // A has number, B doesn't
    if (detailsB.num !== null) return 1;  // B has number, A doesn't
    
    // Fallback: if prefixes are same and neither has a distinguishable number, sort by full name
    return a.name.localeCompare(b.name);
  });
  return { tables: sortedTables };
};
