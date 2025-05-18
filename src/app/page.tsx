
import fs from 'node:fs';
import path from 'node:path';
import Header from '@/components/layout/header';
import SeatingChartDisplay from '@/components/seating-chart-display';
import { generateSampleData } from '@/lib/sample-data';
import { parseSeatingChartCsv, sortTableData } from '@/lib/seating-utils';
import type { SeatingChartData } from '@/types/seating';
import { Toaster } from '@/components/ui/toaster';

// Function to load initial data. It tries from CSV first, then falls back to sample data.
// This function will run on the server during SSR or build time.
function loadInitialData(): SeatingChartData {
  const csvFilePath = path.join(process.cwd(), 'src', 'data', 'initial-seating-chart.csv');
  let seatingData: SeatingChartData | null = null;

  try {
    if (fs.existsSync(csvFilePath)) {
      const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
      const parsedData = parseSeatingChartCsv(csvContent);
      if (parsedData && parsedData.tables.length > 0) {
        seatingData = sortTableData(parsedData);
        console.log('Successfully loaded and parsed initial data from initial-seating-chart.csv');
      } else {
        console.warn('initial-seating-chart.csv was found but is empty or could not be parsed into valid data. Falling back to sample data.');
      }
    } else {
      console.warn('initial-seating-chart.csv not found in src/data/. Falling back to sample data.');
    }
  } catch (error) {
    console.error('Error reading or parsing initial-seating-chart.csv:', error, 'Falling back to sample data.');
  }

  if (!seatingData) {
    seatingData = sortTableData(generateSampleData());
  }
  
  return seatingData;
}

export default function HomePage() {
  const initialData = loadInitialData();

  return (
    <div className="min-h-screen flex flex-col">
      <Header appName="Jaanvi's Sweet Seats" />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-0 sm:py-8">
        <SeatingChartDisplay data={initialData} />
      </main>
      <Toaster />
    </div>
  );
}
