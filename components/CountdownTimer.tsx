
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  label: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, label }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="bg-slate-900 text-emerald-400 p-6 rounded-[32px] text-center font-black">
        🎉 {label} 当日です！お疲れ様でした！
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden bg-slate-900 rounded-[32px] p-6 shadow-2xl shadow-indigo-200/50 border border-slate-800">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 opacity-50"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">
           Countdown to {label}
        </div>
        
        <div className="flex items-baseline gap-4 md:gap-8">
          <TimeBlock value={timeLeft.d} label="DAYS" />
          <Separator />
          <TimeBlock value={timeLeft.h} label="HOURS" />
          <Separator />
          <TimeBlock value={timeLeft.m} label="MINS" />
          <Separator />
          <TimeBlock value={timeLeft.s} label="SECS" isAccent />
        </div>
      </div>
    </div>
  );
};

const TimeBlock = ({ value, label, isAccent = false }: { value: number, label: string, isAccent?: boolean }) => (
  <div className="flex flex-col items-center">
    <span className={`text-4xl md:text-6xl font-black tabular-nums tracking-tighter ${isAccent ? 'text-rose-500' : 'text-white'}`}>
      {value.toString().padStart(2, '0')}
    </span>
    <span className="text-[8px] font-bold text-slate-500 mt-1">{label}</span>
  </div>
);

const Separator = () => (
  <span className="text-3xl md:text-5xl font-black text-slate-700 pb-4">:</span>
);

export default CountdownTimer;
