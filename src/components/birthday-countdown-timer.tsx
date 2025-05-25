
'use client';

import { useState, useEffect, type CSSProperties } from 'react';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

// Target date: May 25, 2025, 7:00 PM ET.
// ET is EDT (UTC-4) in May. So, 19:00 ET is 23:00 UTC.
const TARGET_DATE_UTC = new Date(Date.UTC(2025, 4, 25, 23, 0, 0)); // Month 4 is May, 23 hours is 7 PM ET
const FORMATTED_TARGET_DATE = "(05/25 07:00 PM)"; // Removed ET

const calculateTimeLeft = (): TimeLeft | null => {
  const difference = +TARGET_DATE_UTC - +new Date(); // `+` converts date to number (milliseconds)
  if (difference <= 0) {
    return null; // Countdown finished
  }

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    hours,
    minutes,
    seconds,
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
    }, 1000); // Update every second

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
      <div className={`${baseClasses} bg-accent text-accent-foreground font-semibold`}>
        It's Showtime!
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-accent text-accent-foreground`}>
      {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s until showtime! {FORMATTED_TARGET_DATE}
    </div>
  );
};

export default BirthdayCountdownTimer;
