export interface Guest {
  id: string;
  name: string;
}

export interface Table {
  id: string;
  name: string;
  guests: Guest[];
}

export interface SeatingChartData {
  tables: Table[];
}
