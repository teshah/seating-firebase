
"use client";

import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import type { SeatingChartData, Table as TableType } from '@/types/seating';
import TableCard from './table-card';
import { Input } from '@/components/ui/input';
import { Search, Users, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SeatingChartDisplayProps {
  data: SeatingChartData;
}

const SeatingChartDisplay: FC<SeatingChartDisplayProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedGuestName, setHighlightedGuestName] = useState<string | null>(null);
  
  const [foundGuestsDetails, setFoundGuestsDetails] = useState<{ guestName: string, tableName: string }[]>([]);
  const [displayedTables, setDisplayedTables] = useState<TableType[]>(() => data.tables);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setHighlightedGuestName(null);
      setFoundGuestsDetails([]);
      setDisplayedTables(data.tables);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const newFoundGuestsDetails: { guestName: string, tableName: string }[] = [];
    let tablesToShow: TableType[] = [];
    let guestNameToHighlight: string | null = null;

    const tablesContainingMatchingGuests: TableType[] = [];

    data.tables.forEach(table => {
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
      tablesToShow = data.tables.filter(table =>
        table.name.toLowerCase().includes(lowerSearchTerm)
      );
      guestNameToHighlight = null; 
    }

    setDisplayedTables(tablesToShow);
    setFoundGuestsDetails(newFoundGuestsDetails);
    setHighlightedGuestName(guestNameToHighlight);
  }, [data.tables, searchTerm]);


  const totalGuests = useMemo(() => {
    return data.tables.reduce((sum, table) => sum + table.guests.length, 0);
  }, [data.tables]);

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
        {/* View mode toggle buttons removed */}
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

      {displayedTables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedTables.map((table, index) => (
            <TableCard key={table.id} table={table} tableIndex={index} highlightedGuestName={highlightedGuestName} />
          ))}
        </div>
      )}
      
      {/* List view rendering removed */}

      <footer className="mt-8 pt-4 border-t border-border text-center text-muted-foreground text-sm">
        <p>Total Tables: {data.tables.length} | Total Guests: {totalGuests}</p>
        <p>Seating Savior &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default SeatingChartDisplay;
