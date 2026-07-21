"use client";

import { useEffect, useState } from "react";
import { Heading, Paragraph } from "@digdir/designsystemet-react";

type MasterProgressProps = {
  start: string;
  end: string;
};

const MasterProgress = ({ start, end }: MasterProgressProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startDate = Date.parse(start);
    const endDate = Date.parse(end);
    const updateProgress = () => {
      const rawProgress = ((Date.now() - startDate) / (endDate - startDate)) * 100;
      setProgress(Number.isFinite(rawProgress) ? Math.min(100, Math.max(0, rawProgress)) : 0);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000);
    return () => clearInterval(interval);
  }, [end, start]);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Heading data-size="sm" style={{ marginBottom: 0 }}>
          Fremdrift
        </Heading>
        <span className="text-xs font-semibold" style={{ color: "var(--ds-color-neutral-text-default)" }}>
          {Math.round(progress)}%
        </span>
      </div>
      <div
        className="mt-2 h-2 w-full rounded-full"
        style={{ backgroundColor: "var(--ds-color-neutral-border-subtle)" }}
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: "var(--ds-color-accent-base-default)" }}
        />
      </div>
      <Paragraph data-size="xs" style={{ margin: "0.5rem 0 0", color: "var(--ds-color-neutral-text-default)" }}>
        Basert på tidslinjen fra {start.split("T")[0]} til {end.split("T")[0]}.
      </Paragraph>
    </>
  );
};

export default MasterProgress;
