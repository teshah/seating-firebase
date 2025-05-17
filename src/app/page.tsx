import Header from '@/components/layout/header';
import SeatingChartDisplay from '@/components/seating-chart-display';
import { generateSampleData } from '@/lib/sample-data';
import { Toaster }
from '@/components/ui/toaster';

export default function HomePage() {
  const sampleData = generateSampleData();

  return (
    <div className="min-h-screen flex flex-col">
      <Header appName="Jaanvi's Sweet Seats" />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-0 sm:py-8">
        <SeatingChartDisplay data={sampleData} />
      </main>
      <Toaster />
    </div>
  );
}
