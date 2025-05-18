"use client";

import type { FC } from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Confetti from 'react-confetti'; // Added for confetti effect
import type { SeatingChartData, Table as TableType, Guest } from '@/types/seating';
import { parseSeatingChartCsv, sortTableData } from '@/lib/seating-utils';
import TableCard from './table-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Info, UploadCloud, PartyPopper, Download } from 'lucide-react'; // Added PartyPopper, Download
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface SeatingChartDisplayProps {
  data: SeatingChartData;
}

const UPLOAD_SECRET_KEY = 'upload';
const UPLOAD_SECRET_VALUE = 'true';

const WISH_PARAM_KEY = 'wish';
const WISH_PARAM_VALUE = 'true';

const SeatingChartDisplay: FC<SeatingChartDisplayProps> = ({ data }) => {
  const [currentSeatingData, setCurrentSeatingData] = useState<SeatingChartData>(() => sortTableData(data));
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedGuestName, setHighlightedGuestName] = useState<string | null>(null);
  
  const [foundGuestsDetails, setFoundGuestsDetails] = useState<{ guestName: string, tableName: string }[]>([]);
  const [displayedTables, setDisplayedTables] = useState<TableType[]>(() => currentSeatingData.tables);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [canShowUploadButton, setCanShowUploadButton] = useState(false);
  const [canShowWishButton, setCanShowWishButton] = useState(false);
  const [runConfetti, setRunConfetti] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setCanShowUploadButton(searchParams.get(UPLOAD_SECRET_KEY) === UPLOAD_SECRET_VALUE);
    setCanShowWishButton(searchParams.get(WISH_PARAM_KEY) === WISH_PARAM_VALUE);
  }, [searchParams]);

  useEffect(() => {
    setCurrentSeatingData(sortTableData(data));
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
      tablesToShow = currentSeatingData.tables.filter(table => 
        tablesContainingMatchingGuests.some(matchedTable => matchedTable.id === table.id)
      );
    } else {
       tablesToShow = currentSeatingData.tables.filter(table =>
        table.name.toLowerCase().includes(lowerSearchTerm)
      ); 
      guestNameToHighlight = tablesToShow.length > 0 ? null : null;
    }

    setDisplayedTables(tablesToShow);
    setFoundGuestsDetails(newFoundGuestsDetails);
    setHighlightedGuestName(guestNameToHighlight);
  }, [currentSeatingData.tables, searchTerm]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
        if (parsedData && parsedData.tables.length > 0 && parsedData.tables.length <= 20) {
          setCurrentSeatingData(sortTableData(parsedData));
          setSearchTerm('');
          toast({
            title: "CSV Uploaded Successfully",
            description: "Seating chart has been updated with the CSV data.",
          });
        } else if (parsedData && parsedData.tables.length > 20) {
           toast({
            title: "CSV Upload Failed",
            description: "The CSV file contains more than 20 tables. Please upload a file with 1 to 20 tables.",
            variant: "destructive",
          });
        }
        else {
          toast({
            title: "CSV Upload Failed",
            description: "Could not parse CSV file or file is empty/invalid. Please ensure it's in 'Name,Table' format and has 1 to 20 tables.",
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
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleWishBirthday = () => {
    if (isAudioPlaying) return; // Prevent multiple plays

    toast({
      title: "🎉 Happy Birthday! 🎉",
      description: "Hope you have a fantastic day!",
      duration: 5000,
    });
    setRunConfetti(true);
    setIsAudioPlaying(true);

    try {
      const audio = new Audio('/audio/happy-birthday.mp3');
      audioRef.current = audio;
      
      // Stop audio and cleanup after 15 seconds
      const stopTimeout = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setRunConfetti(false);
          setIsAudioPlaying(false);
          audioRef.current = null;
        }
      }, 15500);

      audio.addEventListener('ended', () => {
        clearTimeout(stopTimeout);
        setRunConfetti(false);
        setIsAudioPlaying(false);
        audioRef.current = null;
      });

      audio.play().catch(error => {
        clearTimeout(stopTimeout);
        console.error("Error playing birthday audio:", error);
        setRunConfetti(false);
        setIsAudioPlaying(false);
        audioRef.current = null;
      });
    } catch (error) {
      console.error("Failed to create audio object:", error);
      setRunConfetti(false);
      setIsAudioPlaying(false);
    }
  };

  const convertToCsv = (data: SeatingChartData): string => {
    const header = "Name,Table\n";
    const rows = data.tables.flatMap(table => 
      table.guests.map(guest => `"${guest.name.replace(/"/g, '""')}","${table.name.replace(/"/g, '""')}"`)
    );
    return header + rows.join("\n");
  };

  const handleDownloadCsv = () => {
    if (currentSeatingData.tables.length === 0) {
      toast({
        title: "No Data to Download",
        description: "The seating chart is currently empty.",
        variant: "destructive",
      });
      return;
    }
    const csvString = convertToCsv(currentSeatingData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "seating-chart.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "CSV Downloaded",
      description: "Current seating assignments have been downloaded.",
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {runConfetti && (
        <Confetti
          run={runConfetti}
          recycle={true}
          numberOfPieces={250}
          className="!fixed"
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
          <div className="relative w-full sm:flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by guest or table name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-base w-full"
              aria-label="Search seating chart"
            />
          </div>
          {canShowWishButton && (
            <Button 
              onClick={handleWishBirthday} 
              variant="outline" 
              size="default" 
              className="w-full sm:w-auto flex-shrink-0"
              disabled={isAudioPlaying}
            >
              <PartyPopper className="mr-2 h-5 w-5" />
              {isAudioPlaying ? "Playing..." : "Wish Happy Birthday"}
            </Button>
          )}
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
                <p className="mb-1">Found {foundGuestsDetails.length} guests matching "{searchTerm}":</p>
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
      
      {currentSeatingData.tables.length === 0 && !searchTerm && (
         <Alert variant="default">
            <Info className="h-5 w-5" />
            <AlertTitle>Empty Seating Chart</AlertTitle>
            <AlertDescription>
                The seating chart is currently empty. You can upload a CSV file to populate it or it might be loading from a local file.
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
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
            {canShowUploadButton && (
                <Button variant="outline" size="sm" onClick={handleUploadClick} className="text-xs">
                    <UploadCloud className="mr-2 h-3 w-3" />
                    Upload CSV (Name,Table)
                </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDownloadCsv} className="text-xs">
                <Download className="mr-2 h-3 w-3" />
                Download CSV
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
    
