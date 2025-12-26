"use client";

import { useState, useEffect } from "react";

const MasterCountdown = () => {
  const targetDate = new Date("2027-06-15T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple/20 to-ocean/20 rounded-2xl p-8 border border-purple/30 hover:border-purple/50 transition-all h-full">
      <div className="flex flex-col justify-center h-full">
        <p className="text-sm text-gray-400 mb-6">🎓 Tid til mastergrad</p>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Dager", value: timeLeft.days },
            { label: "Timer", value: timeLeft.hours },
            { label: "Min", value: timeLeft.minutes },
            { label: "Sek", value: timeLeft.seconds },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple mb-2">
                {item.value}
              </div>
              <div className="text-xs text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasterCountdown;
