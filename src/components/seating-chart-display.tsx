
"use client";

import type { FC } from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
// import Confetti from 'react-confetti'; // Added for confetti effect
import type { SeatingChartData, Table as TableType, Guest } from '@/types/seating';
import { parseSeatingChartCsv, sortTableData } from '@/lib/seating-utils';
import TableCard from './table-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Info, UploadCloud, PartyPopper, Download, Square, Gift } from 'lucide-react'; // Added PartyPopper, Download, Square, Gift
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import BirthdayCountdownTimer from './birthday-countdown-timer'; // Import the new component

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [canShowUploadButton, setCanShowUploadButton] = useState(false);
  const [canShowWishButton, setCanShowWishButton] = useState(false);
  const [runConfetti, setRunConfetti] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 }); // For confetti

  useEffect(() => {
    setCanShowUploadButton(searchParams.get(UPLOAD_SECRET_KEY) === UPLOAD_SECRET_VALUE);
    setCanShowWishButton(searchParams.get(WISH_PARAM_KEY) === WISH_PARAM_VALUE);
  }, [searchParams]);

  useEffect(() => {
    setCurrentSeatingData(sortTableData(data));
  }, [data]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }
    };
    if (typeof window !== 'undefined') {
      handleResize(); // Set initial size
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
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

  const handleAudioEnded = () => {
    setRunConfetti(false);
    setIsAudioPlaying(false);
    if (audioRef.current) {
        audioRef.current.currentTime = 0; // Reset for next play
    }
  };

  useEffect(() => {
    const currentAudio = audioRef.current;
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.removeEventListener('ended', handleAudioEnded);
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
    if (isAudioPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.removeEventListener('ended', handleAudioEnded);
      }
      setRunConfetti(false);
      setIsAudioPlaying(false);
    } else {
      toast({
        title: "🎉 Happy Birthday, Jaanvi! 🎉",
        description: "Hope you have a fantastic day!",
        duration: 5000,
      });
      setRunConfetti(true);
      setIsAudioPlaying(true);

      if (!audioRef.current) {
        try {
          audioRef.current = new Audio('/audio/happy-birthday.mp3');
        } catch (error) {
          console.error("Failed to create audio object:", error);
          setRunConfetti(false);
          setIsAudioPlaying(false);
          return;
        }
      }
      
      audioRef.current.removeEventListener('ended', handleAudioEnded); // Ensure only one listener
      audioRef.current.addEventListener('ended', handleAudioEnded);
      audioRef.current.play().catch(error => {
        console.error("Error playing birthday audio:", error);
        setRunConfetti(false);
        setIsAudioPlaying(false);
        audioRef.current?.removeEventListener('ended', handleAudioEnded);
      });
    }
  };

  const convertToCsv = (data: SeatingChartData): string => {
    const header = "Name,Table\n";
    const rows = data.tables.flatMap(table => 
      table.guests.map(guest => `"${guest.name.replace(/"/g, '""')}","${table.name.replace(/"/g, '""')}"`)
    );
    return header + rows.join("\n");
  };

  const handleCopyrightToggle = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    if (currentParams.get(WISH_PARAM_KEY) === WISH_PARAM_VALUE) {
      currentParams.delete(WISH_PARAM_KEY);
    } else {
      currentParams.set(WISH_PARAM_KEY, WISH_PARAM_VALUE);
    }
    const newQueryString = currentParams.toString();
    router.push(pathname + (newQueryString ? `?${newQueryString}` : ''));
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {/* typeof window !== 'undefined' && runConfetti && ( // Ensure window is defined for Confetti
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          run={runConfetti}
          recycle={true}
          numberOfPieces={250}
          className="!fixed" // Ensure confetti covers the whole screen
        />
      )*/}
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
            <div className="flex items-center gap-2 flex-wrap"> {/* Flex container for button and timer */}
              <Button 
                onClick={handleWishBirthday} 
                variant="outline" 
                size="default" 
                className="w-full xxs:w-auto flex-shrink-0" /* Adjusted for very small screens */
              >
                {isAudioPlaying ? <Square className="mr-2 h-5 w-5" /> : <PartyPopper className="mr-2 h-5 w-5" />}
                {isAudioPlaying ? "Stop Birthday Song" : "Wish Jaanvi a Happy Birthday!"}
              </Button>
              <BirthdayCountdownTimer />
            </div>
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
        <p
          onClick={handleCopyrightToggle}
          className="cursor-pointer hover:underline"
          role="button"
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent<HTMLParagraphElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCopyrightToggle();
            }
          }}
        >
          Seating Savior &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default SeatingChartDisplay;
