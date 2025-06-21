import { useState, useEffect } from 'react';

interface ShiftState {
  isActive: boolean;
  startTime: string | null;
  duration: number; // in minutes
}

export const useShift = () => {
  const [shiftState, setShiftState] = useState<ShiftState>({
    isActive: false,
    startTime: null,
    duration: 0
  });

  useEffect(() => {
    // Load shift state from localStorage on mount
    const savedShiftActive = localStorage.getItem('cashierShiftActive');
    const savedShiftStartTime = localStorage.getItem('cashierShiftStartTime');
    
    if (savedShiftActive === 'true' && savedShiftStartTime) {
      setShiftState({
        isActive: true,
        startTime: savedShiftStartTime,
        duration: Math.floor((Date.now() - new Date(savedShiftStartTime).getTime()) / (1000 * 60))
      });
    }

    // Update duration every minute if shift is active
    const interval = setInterval(() => {
      if (savedShiftActive === 'true' && savedShiftStartTime) {
        const duration = Math.floor((Date.now() - new Date(savedShiftStartTime).getTime()) / (1000 * 60));
        setShiftState(prev => ({ ...prev, duration }));
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const startShift = () => {
    const startTime = new Date().toISOString();
    setShiftState({
      isActive: true,
      startTime,
      duration: 0
    });
    localStorage.setItem('cashierShiftActive', 'true');
    localStorage.setItem('cashierShiftStartTime', startTime);
  };

  const endShift = () => {
    setShiftState({
      isActive: false,
      startTime: null,
      duration: 0
    });
    localStorage.removeItem('cashierShiftActive');
    localStorage.removeItem('cashierShiftStartTime');
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return {
    ...shiftState,
    startShift,
    endShift,
    formatDuration
  };
};
