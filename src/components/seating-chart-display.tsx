
"use client";

import type { FC } from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import type { SeatingChartData, Table as TableType, Guest } from '@/types/seating';
import TableCard from './table-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Info, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface SeatingChartDisplayProps {
  data: SeatingChartData;
}

// Helper function to parse CSV
function parseSeatingChartCsv(csvString: string): SeatingChartData | null {
  try {
    const lines = csvString.trim().split('\n');
    if (lines.length === 0) return null;

    const guestTableMap = new Map<string, Guest[]>();
    let guestIdCounter = 0;

    // Skip header if present (simple check for "name" and "table" in the first line)
    const firstLineLower = lines[0].toLowerCase();
    const startIndex = (firstLineLower.includes('name') && firstLineLower.includes('table')) ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle potential quotes around fields, common in CSV
      const parts = line.split(',').map(part => part.trim().replace(/^"|"$/g, ''));
      
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
        id: `csv-guest-${guestIdCounter++}-${Date.now()}`, // Simple unique ID
        name: guestName,
      });
    }

    if (guestTableMap.size === 0) {
        // If after parsing, no valid data was extracted (e.g. header only, or all lines invalid)
        console.warn("CSV parsing resulted in no valid table data.");
        return null;
    }

    const tables: TableType[] = [];
    let tableIdCounter = 0;
    for (const [tableName, guests] of guestTableMap.entries()) {
      tables.push({
        id: `csv-table-${tableIdCounter++}-${Date.now()}`, // Simple unique ID
        name: tableName,
        guests: guests,
      });
    }
    tables.sort((a, b) => a.name.localeCompare(b.name)); // Sort tables by name

    return { tables };
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return null;
  }
}


const SeatingChartDisplay: FC<SeatingChartDisplayProps> = ({ data }) => {
  const [currentSeatingData, setCurrentSeatingData] = useState<SeatingChartData>(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedGuestName, setHighlightedGuestName] = useState<string | null>(null);
  
  const [foundGuestsDetails, setFoundGuestsDetails] = useState<{ guestName: string, tableName: string }[]>([]);
  const [displayedTables, setDisplayedTables] = useState<TableType[]>(() => currentSeatingData.tables);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Effect to update displayed data if the prop 'data' changes (e.g., for initial load or reset)
  useEffect(() => {
    setCurrentSeatingData(data);
  }, [data]);
  
  useEffect(() => {
    if (!searchTerm.trim()) {
      setHighlightedGuestName(null);
      setFoundGuestsDetails([]);
      setDisplayedTables(currentSeatingData.tables);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const newFoundGuestsDetails: { guestName: string, tableName: string }[] = [];
    let tablesToShow: TableType[] = [];
    let guestNameToHighlight: string | null = null;

    const tablesContainingMatchingGuests: TableType[] = [];

    currentSeatingData.tables.forEach(table => {
      let tableHasMatch = false;
      table.guests.forEach(guest => {
        if (guest.name.toLowerCase().includes(lowerSearchTerm)) {
          newFoundGuestsDetails.push({ guestName: guest.name, tableName: table.name });
          tableHasMatch = true;
        }
      });
      if (tableHasMatch) {
        if (!tablesContainingMatchingGuests.some(t => t.id === table.id)) {
             tablesContainingMatchingGuests.push(table);
        }
      }
    });

    if (newFoundGuestsDetails.length > 0) {
      guestNameToHighlight = searchTerm; 
      tablesToShow = tablesContainingMatchingGuests;
    } else {
      tablesToShow = currentSeatingData.tables.filter(table =>
        table.name.toLowerCase().includes(lowerSearchTerm)
      );
      guestNameToHighlight = null; 
    }

    setDisplayedTables(tablesToShow);
    setFoundGuestsDetails(newFoundGuestsDetails);
    setHighlightedGuestName(guestNameToHighlight);
  }, [currentSeatingData.tables, searchTerm]);


  const totalGuests = useMemo(() => {
    return currentSeatingData.tables.reduce((sum, table) => sum + table.guests.length, 0);
  }, [currentSeatingData.tables]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsedData = parseSeatingChartCsv(text);
        if (parsedData && parsedData.tables.length > 0) {
          setCurrentSeatingData(parsedData);
          setSearchTerm(''); // Reset search term
          toast({
            title: "CSV Uploaded Successfully",
            description: "Seating chart has been updated with the CSV data.",
          });
        } else {
          toast({
            title: "CSV Upload Failed",
            description: "Could not parse CSV file or file is empty/invalid. Please ensure it's in 'Name,Table' format.",
            variant: "destructive",
          });
        }
      };
      reader.onerror = () => {
        toast({
            title: "File Read Error",
            description: "Could not read the selected file.",
            variant: "destructive",
          });
      }
      reader.readAsText(file);
      // Reset file input value to allow uploading the same file again
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-border">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by guest or table name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 text-base"
            aria-label="Search seating chart"
          />
        </div>
      </div>

      {searchTerm && foundGuestsDetails.length > 0 && (
        <Alert variant="default" className="bg-accent/20 border-accent">
          <Users className="h-5 w-5 text-accent" />
          <AlertTitle className="text-accent">Search Results</AlertTitle>
          <AlertDescription className="text-black dark:text-gray-100">
            {foundGuestsDetails.length === 1 && (
              <div>
                <strong>{foundGuestsDetails[0].guestName}</strong> is seated at <strong>{foundGuestsDetails[0].tableName}</strong>.
              </div>
            )}
            {foundGuestsDetails.length > 1 && (
              <>
                <p className="mb-1">Found {foundGuestsDetails.length} instances of guests matching "{searchTerm}":</p>
                <ul className="list-disc pl-5 space-y-0.5 max-h-32 overflow-y-auto">
                  {foundGuestsDetails.map((detail, index) => (
                    <li key={index}>
                      <strong>{detail.guestName}</strong> at <strong>{detail.tableName}</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-1">Relevant tables are listed below, and matching guests are highlighted.</p>
          </AlertDescription>
        </Alert>
      )}

      {searchTerm && displayedTables.length === 0 && (
         <Alert variant="destructive">
          <Info className="h-5 w-5" />
          <AlertTitle>No Results</AlertTitle>
          <AlertDescription>
            No tables or guests found matching your search term "{searchTerm}". Please try a different search.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Always show tables if currentSeatingData has tables, search will filter them via displayedTables */}
      {currentSeatingData.tables.length === 0 && !searchTerm && (
         <Alert variant="default">
            <Info className="h-5 w-5" />
            <AlertTitle>Empty Seating Chart</AlertTitle>
            <AlertDescription>
                The seating chart is currently empty. You can upload a CSV file to populate it.
            </AlertDescription>
        </Alert>
      )}

      {displayedTables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedTables.map((table, index) => (
            <TableCard key={table.id} table={table} tableIndex={index} highlightedGuestName={highlightedGuestName} />
          ))}
        </div>
      )}
      
      <footer className="mt-8 pt-4 border-t border-border text-center text-muted-foreground text-sm space-y-2">
        <div>
            <Button variant="outline" size="sm" onClick={handleUploadClick} className="text-xs">
                <UploadCloud className="mr-2 h-3 w-3" />
                Upload CSV (Name,Table)
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
                aria-hidden="true"
            />
        </div>
        <p>Total Tables: {currentSeatingData.tables.length} | Total Guests: {totalGuests}</p>
        <p>Seating Savior &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default SeatingChartDisplay;

