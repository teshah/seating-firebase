
'use client';

import { useState, useEffect, type CSSProperties } from 'react';

interface TimeLeft {
  hours: number;
  minutes: number;
}

// Target date: May 25, 2025, 7:10 PM ET.
// ET is EDT (UTC-4) in May. So, 19:10 ET is 23:10 UTC.
const TARGET_DATE_UTC = new Date(Date.UTC(2025, 4, 25, 23, 10, 0)); // Month 4 is May
const FORMATTED_TARGET_DATE_ET = "(05/25 19:10 ET)";

const calculateTimeLeft = (): TimeLeft | null => {
  const difference = +TARGET_DATE_UTC - +new Date(); // `+` converts date to number (milliseconds)
  if (difference <= 0) {
    return null; // Countdown finished
  }

  const totalHours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference / 1000 / 60) % 60);

  return {
    hours: totalHours,
    minutes: minutes,
  };
};

const BirthdayCountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTimeLeft(calculateTimeLeft()); // Set initial time after client mount

    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timerId); // Cleanup interval on component unmount
  }, []);

  // Adjusted classes for width consistency with the button.
  // Removed min-w-[160px], added w-full sm:w-auto flex-shrink-0
  const baseClasses = "text-sm p-2 border rounded-md shadow-sm whitespace-nowrap h-10 flex items-center justify-center w-full sm:w-auto flex-shrink-0";

  if (!isMounted) {
    // Placeholder during SSR or before hydration
    return (
      <div className={`${baseClasses} bg-muted text-muted-foreground`} aria-live="polite">
        Loading countdown...
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className={`${baseClasses} bg-accent/20 border-accent text-accent-foreground font-semibold`}>
        It's Showtime!
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-card border-border text-card-foreground`}>
      {timeLeft.hours}h {timeLeft.minutes}m until showtime! {FORMATTED_TARGET_DATE_ET}
    </div>
  );
};

export default BirthdayCountdownTimer;
