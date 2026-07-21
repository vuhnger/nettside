import { z } from "zod";
import { fetchApi } from "@/services/api/client";

type ApiStatus = "up" | "down";

const apiHealthSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  database: z.string(),
});

const statusLabels: Record<ApiStatus, string> = {
  up: "API-et er tilgjengelig",
  down: "API-et er utilgjengelig",
};

const ApiStatusLink = async () => {
  const status: ApiStatus = await fetchApi("/strava/health", apiHealthSchema)
    .then(() => "up" as const)
    .catch(() => "down" as const);

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
              : "var(--ds-color-danger-base-default)"
        }}
      />
      <span className="sr-only">
        {statusLabels[status]}
      </span>
    </a>
  );
};

export default ApiStatusLink;
