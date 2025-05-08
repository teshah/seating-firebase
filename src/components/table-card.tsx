
import type { FC } from 'react';
import type { Table as TableType, Guest } from '@/types/seating';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, ListChecks } from 'lucide-react';

interface TableCardProps {
  table: TableType;
  tableIndex: number;
  highlightedGuestName?: string | null; // Added for highlighting
}

const sevenWondersHints = [
  "pyramid giza", 
  "hanging gardens babylon", 
  "statue zeus olympia", 
  "temple artemis ephesus", 
  "mausoleum halicarnassus", 
  "colossus rhodes", 
  "lighthouse alexandria"
];

const TableCard: FC<TableCardProps> = ({ table, tableIndex, highlightedGuestName }) => {
  const guestRows: Guest[][] = [];
  for (let i = 0; i < table.guests.length; i += 2) {
    guestRows.push(table.guests.slice(i, i + 2));
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader 
        className="relative flex flex-row items-center justify-between space-y-0 rounded-t-lg border-b border-border overflow-hidden h-24 p-0"
        data-ai-hint={sevenWondersHints[tableIndex % sevenWondersHints.length]}
      >
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(https://picsum.photos/300/100?random=${tableIndex})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/40 z-0" aria-hidden="true"/> 

        <div className="relative z-10 flex flex-row items-center justify-between w-full px-4 py-2">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-white" aria-hidden="true" />
            {table.name}
          </CardTitle>
          <div className="flex items-center text-xs text-white">
            <Users className="mr-1 h-4 w-4 text-white" aria-hidden="true" />
            {table.guests.length} Guests
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3 flex-grow">
        {table.guests.length > 0 ? (
          <ul className="space-y-0.5 max-h-48 overflow-y-auto pr-1 text-xs">
            {guestRows.map((rowGuests, rowIndex) => (
              <li
                key={`guest-row-${table.id}-${rowIndex}`}
                className="flex items-center py-0.5 px-1 rounded hover:bg-accent/10"
              >
                {rowGuests.map((guest, guestIndexInRow) => (
                  <span
                    key={guest.id}
                    className={`
                      ${rowGuests.length === 2 ? 'w-1/2' : 'w-full'}
                      ${guestIndexInRow === 0 && rowGuests.length === 2 ? 'pr-1 break-words' : 'break-words'}
                      ${guestIndexInRow === 1 && rowGuests.length === 2 ? 'pl-1 break-words' : ''}
                      ${highlightedGuestName && guest.name.toLowerCase().includes(highlightedGuestName.toLowerCase())
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
          <p className="text-xs text-muted-foreground italic p-2 text-center">No guests assigned.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TableCard;
