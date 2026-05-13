import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface TimerContextType {
  timeLeft: number;
  isActive: boolean;
  startTimer: (seconds: number) => void;
  stopTimer: () => void;
  addTime: (seconds: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          window.clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isActive]);

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  const addTime = (seconds: number) => {
    setTimeLeft((prev) => prev + seconds);
  };

  return (
    <TimerContext.Provider value={{ timeLeft, isActive, startTimer, stopTimer, addTime }}>
      {children}
    </TimerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimer must be used within a TimerProvider");
  return context;
};