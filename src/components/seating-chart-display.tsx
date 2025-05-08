
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

const flowerHints = ["rose", "tulip", "sunflower", "daisy", "lily", "orchid", "poppy", "lavender", "marigold", "peony"];

interface SeatingChartDisplayProps {
  data: SeatingChartData;
}

const SeatingChartDisplay: FC<SeatingChartDisplayProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedGuestName, setHighlightedGuestName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); 

  const filteredTablesAndGuests = useMemo(() => {
    if (!searchTerm.trim()) {
      setHighlightedGuestName(null);
      return { tables: data.tables, guestHighlight: null };
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    let guestResult: { table: TableType, guest: Guest } | null = null;

    for (const table of data.tables) {
      for (const guest of table.guests) {
        if (guest.name.toLowerCase() === lowerSearchTerm) {
          guestResult = { table, guest };
          break;
        }
      }
      if (guestResult) break;
    }
    
    if (!guestResult) {
      for (const table of data.tables) {
        for (const guest of table.guests) {
          if (guest.name.toLowerCase().includes(lowerSearchTerm)) {
            guestResult = { table, guest }; 
            break;
          }
        }
        if (guestResult) break;
      }
    }

    if (guestResult) {
      setHighlightedGuestName(guestResult.guest.name);
      return { tables: [guestResult.table], guestHighlight: guestResult.guest.name };
    }

    setHighlightedGuestName(null);
    const tablesByName = data.tables.filter(table =>
      table.name.toLowerCase().includes(lowerSearchTerm)
    );
    return { tables: tablesByName, guestHighlight: null };

  }, [data.tables, searchTerm]);


  const totalGuests = useMemo(() => {
    return data.tables.reduce((sum, table) => sum + table.guests.length, 0);
  }, [data.tables]);


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
          {filteredTablesAndGuests.tables.map((table, index) => (
            <TableCard key={table.id} table={table} tableIndex={index} />
          ))}
        </div>
      )}
      {filteredTablesAndGuests.tables.length > 0 && viewMode === 'list' && (
         <div className="space-y-4">
          {filteredTablesAndGuests.tables.map((table, tableIndex) => {
            const guestRows: Guest[][] = [];
            for (let i = 0; i < table.guests.length; i += 2) {
              guestRows.push(table.guests.slice(i, i + 2));
            }

            return (
              <Card key={table.id} className="shadow-md">
                <CardHeader 
                  className="relative flex flex-row items-center justify-between space-y-0 rounded-t-lg border-b border-border overflow-hidden h-24 p-0"
                  data-ai-hint={flowerHints[tableIndex % flowerHints.length]}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url(https://picsum.photos/400/100?random=${tableIndex})` }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-black/40 z-0" aria-hidden="true"/>
                  <div className="relative z-10 flex items-center justify-between w-full px-6 py-3">
                    <CardTitle className="text-xl font-semibold text-white">
                      {table.name}
                    </CardTitle>
                    <span className="text-sm text-white flex items-center">
                      <Users className="mr-1 h-4 w-4 text-white"/>
                      {table.guests.length} Guests
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {table.guests.length > 0 ? (
                    <ul className="space-y-1">
                      {guestRows.map((rowGuests, rowIndex) => (
                        <li
                          key={`guest-row-${table.id}-${rowIndex}`}
                          className="flex items-center py-1.5 px-2 rounded hover:bg-accent/10 transition-colors duration-150 text-sm"
                        >
                          {rowGuests.map((guest, guestIndexInRow) => (
                            <span
                              key={guest.id}
                              className={`
                                ${rowGuests.length === 2 ? 'w-1/2' : 'w-full'}
                                ${guestIndexInRow === 0 && rowGuests.length === 2 ? 'pr-2' : ''}
                                ${guestIndexInRow === 1 && rowGuests.length === 2 ? 'pl-2' : ''}
                                break-words
                                ${guest.name === highlightedGuestName
                                  ? 'bg-accent text-accent-foreground rounded font-semibold px-1 py-0.5'
                                  : 'text-foreground/90 px-1 py-0.5'
                                }
                              `}
                            >
                              {guest.name}
                            </span>
                          ))}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No guests assigned to this table.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
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
