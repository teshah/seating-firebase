import type { FC } from 'react';
import type { Table as TableType } from '@/types/seating';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, ListChecks } from 'lucide-react';

interface TableCardProps {
  table: TableType;
}

const TableCard: FC<TableCardProps> = ({ table }) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-secondary/30 rounded-t-lg border-b border-border">
        <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
          <ListChecks className="h-6 w-6" aria-hidden="true" />
          {table.name}
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" aria-hidden="true" />
          {table.guests.length} Guests
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-grow">
        {table.guests.length > 0 ? (
          <ul className="space-y-1 max-h-60 overflow-y-auto pr-2">
            {table.guests.map((guest) => (
              <li key={guest.id} className="text-foreground/90 text-sm py-1.5 px-2 rounded hover:bg-accent/10 transition-colors duration-150">
                {guest.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">No guests assigned to this table yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TableCard;
