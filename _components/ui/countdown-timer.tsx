"use client";

import { useState, useEffect } from "react";
import classNames from "classnames";

interface CountdownTimerProps {
  deadline: string;
  cssClasses?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
}

function getTimeRemaining(deadline: string): TimeRemaining {
  const diffMs = new Date(deadline).getTime() - Date.now();

  if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0 };

  const totalMinutes = Math.floor(diffMs / 1000 / 60);
  const days = Math.floor(totalMinutes / 60 / 24);
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

export default function CountdownTimer({ deadline, cssClasses }: CountdownTimerProps) {
  const [time, setTime] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    const update = () => setTime(getTimeRemaining(deadline));
    const frame = requestAnimationFrame(update);
    const interval = setInterval(update, 60000);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
    };
  }, [deadline]);

  return (
    <div
      className={classNames(
        "bg-white rounded-[6px] flex items-center justify-center gap-1 px-2 py-1",
        cssClasses
      )}
    >
      <div className="flex flex-col items-center gap-[3px]">
        <p className="text-[12px] font-semibold leading-none">{time?.days ?? 0}</p>
        <p className="text-[6px] leading-none">Days</p>
      </div>

      <div className="w-px self-stretch bg-black opacity-20" />

      <div className="flex flex-col items-center gap-[3px]">
        <p className="text-[12px] font-semibold leading-none">{time?.hours ?? 0}</p>
        <p className="text-[6px] leading-none">Hours</p>
      </div>

      <div className="w-px self-stretch bg-black opacity-20" />

      <div className="flex flex-col items-center gap-[3px]">
        <p className="text-[12px] font-semibold leading-none">{time?.minutes ?? 0}</p>
        <p className="text-[6px] leading-none">Min</p>
      </div>
    </div>
  );
}
