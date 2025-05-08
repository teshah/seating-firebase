
"use client";

import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import type { SeatingChartData, Table as TableType, Guest } from '@/types/seating';
import TableCard from './table-card';
import { Input } from '@/components/ui/input';
import { Search, Users, Info, Grid, List } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';


interface SeatingChartDisplayProps {
  data: SeatingChartData;
}

const SeatingChartDisplay: FC<SeatingChartDisplayProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedGuestName, setHighlightedGuestName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // 'grid' or 'list'

  const filteredTablesAndGuests = useMemo(() => {
    if (!searchTerm.trim()) {
      setHighlightedGuestName(null);
      return { tables: data.tables, guestHighlight: null };
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    let guestResult: { table: TableType, guest: Guest } | null = null;

    // Prioritize finding an exact guest match
    for (const table of data.tables) {
      for (const guest of table.guests) {
        if (guest.name.toLowerCase() === lowerSearchTerm) {
          guestResult = { table, guest };
          break;
        }
      }
      if (guestResult) break;
    }
    
    // If no exact guest match, try partial guest match
    if (!guestResult) {
      for (const table of data.tables) {
        for (const guest of table.guests) {
          if (guest.name.toLowerCase().includes(lowerSearchTerm)) {
            guestResult = { table, guest }; // Take the first partial match
            break;
          }
        }
        if (guestResult) break;
      }
    }

    if (guestResult) {
      setHighlightedGuestName(guestResult.guest.name);
      // Return only the table where the guest was found
      return { tables: [guestResult.table], guestHighlight: guestResult.guest.name };
    }

    // If no guest matches, filter by table name
    setHighlightedGuestName(null);
    const tablesByName = data.tables.filter(table =>
      table.name.toLowerCase().includes(lowerSearchTerm)
    );
    return { tables: tablesByName, guestHighlight: null };

  }, [data.tables, searchTerm]);


  const totalGuests = useMemo(() => {
    return data.tables.reduce((sum, table) => sum + table.guests.length, 0);
  }, [data.tables]);


  // Effect to clear highlight when search term is empty
  useEffect(() => {
    if (!searchTerm.trim()) {
      setHighlightedGuestName(null);
    }
  }, [searchTerm]);

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
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={viewMode === 'grid' ? "default" : "outline"} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
                  <Grid className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Grid View</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={viewMode === 'list' ? "default" : "outline"} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
                  <List className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>List View</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {searchTerm && highlightedGuestName && (
        <Alert variant="default" className="bg-accent/20 border-accent text-accent-foreground">
          <Users className="h-5 w-5 text-accent" />
          <AlertTitle className="text-accent">Guest Found!</AlertTitle>
          <AlertDescription>
            <strong>{highlightedGuestName}</strong> is seated at <strong>{filteredTablesAndGuests.tables[0]?.name}</strong>.
          </AlertDescription>
        </Alert>
      )}

      {filteredTablesAndGuests.tables.length === 0 && searchTerm && (
        <Alert variant="destructive">
          <Info className="h-5 w-5" />
          <AlertTitle>No Results</AlertTitle>
          <AlertDescription>
            No tables or guests found matching your search term "{searchTerm}". Please try a different search.
          </AlertDescription>
        </Alert>
      )}

      {filteredTablesAndGuests.tables.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTablesAndGuests.tables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      )}
      {filteredTablesAndGuests.tables.length > 0 && viewMode === 'list' && (
         <div className="space-y-4">
          {filteredTablesAndGuests.tables.map((table) => (
            <Card key={table.id} className="shadow-md">
              <CardHeader className="bg-secondary/30 rounded-t-lg border-b">
                <CardTitle className="text-xl font-semibold text-primary flex items-center justify-between">
                  <span>{table.name}</span>
                  <span className="text-sm text-muted-foreground flex items-center"><Users className="mr-1 h-4 w-4"/>{table.guests.length} Guests</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {table.guests.length > 0 ? (
                  <ul className="columns-1 sm:columns-2 md:columns-3 gap-x-6">
                    {table.guests.map((guest) => (
                      <li key={guest.id} className={`text-foreground/90 text-sm py-1 px-1 break-inside-avoid-column ${guest.name === highlightedGuestName ? 'bg-accent text-accent-foreground rounded font-semibold' : ''}`}>
                        {guest.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No guests assigned to this table.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}


      <footer className="mt-8 pt-4 border-t border-border text-center text-muted-foreground text-sm">
        <p>Total Tables: {data.tables.length} | Total Guests: {totalGuests}</p>
        <p>Seating Savior &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default SeatingChartDisplay;

