"use client";

import { useState, useEffect } from "react";
import { Card, Paragraph, Heading } from "@digdir/designsystemet-react";

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
    <Card
      style={{
        background: 'linear-gradient(to bottom right, var(--ds-color-accent-base-subtle), var(--ds-color-accent-second-subtle))',
        padding: '1rem',
        height: '100%',
        transition: 'all 0.2s',
        border: '2px solid var(--ds-color-neutral-border-strong)'
      }}
    >
      <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', marginBottom: '0.75rem' }}>
        🎓 Tid til mastergrad
      </Paragraph>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "d", value: timeLeft.days },
          { label: "t", value: timeLeft.hours },
          { label: "m", value: timeLeft.minutes },
          { label: "s", value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.label} style={{ textAlign: 'center' }}>
            <Heading data-size="md" style={{ color: 'var(--ds-color-accent-base-default)', marginBottom: '0.125rem' }}>
              {item.value}
            </Heading>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0 }}>
              {item.label}
            </Paragraph>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MasterCountdown;
