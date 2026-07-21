"use client";

import { useApiStatus } from "./queries";

type ApiStatus = "unknown" | "up" | "down";

const statusLabels: Record<ApiStatus, string> = {
  unknown: "Sjekker API-status",
  up: "API-et er tilgjengelig",
  down: "API-et er utilgjengelig",
};

const ApiStatusLink = () => {
  const apiStatusQuery = useApiStatus();
  const status: ApiStatus = apiStatusQuery.isPending
    ? "unknown"
    : apiStatusQuery.isError || !apiStatusQuery.data
      ? "down"
      : "up";

  return (
    <a
      href="https://api.vuhnger.dev/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        height: '2rem',
        padding: '0 0.625rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        border: '2px solid var(--ds-color-accent-base-default)',
        borderRadius: '0.5rem',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        color: 'var(--ds-color-neutral-text-default)',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        boxShadow: 'var(--accent-shadow)'
      }}
    >
      API
      <span
        aria-hidden="true"
        style={{
          width: '0.5rem',
          height: '0.5rem',
          borderRadius: '999px',
          backgroundColor:
            status === "up"
              ? "var(--ds-color-success-base-default)"
              : status === "down"
                ? "var(--ds-color-danger-base-default)"
                : "var(--ds-color-neutral-border-default)"
        }}
      />
      <span className="sr-only" aria-live="polite">
        {statusLabels[status]}
      </span>
    </a>
  );
};

export default ApiStatusLink;
