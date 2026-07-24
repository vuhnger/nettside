import { Wifi, WifiOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { MODES } from "./config";
import type { Mode } from "./types";

type NetworkControlsProps = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  cloudOnline: boolean;
  onCloudOnlineChange: (online: boolean) => void;
  impairment: number;
  onImpairmentChange: (impairment: number) => void;
  syncing: boolean;
  cloudSwitchId: string;
  impairmentSliderId: string;
};

/** Modusvelger, skykobling-bryter og pakketap-slider over nettverkskartet. */
const NetworkControls = ({
  mode,
  onModeChange,
  cloudOnline,
  onCloudOnlineChange,
  impairment,
  onImpairmentChange,
  syncing,
  cloudSwitchId,
  impairmentSliderId,
}: NetworkControlsProps) => (
  <div
    className="rounded-xl border p-4"
    style={{
      borderColor: "var(--ds-color-neutral-border-subtle)",
      backgroundColor:
        "color-mix(in srgb, var(--ds-color-neutral-surface-default) 92%, transparent)",
      boxShadow: "var(--ds-shadow-lg)",
    }}
  >
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <Tabs value={mode} onValueChange={(value) => onModeChange(value as Mode)}>
          <TabsList
            className="flex h-auto w-full max-w-[640px] flex-col gap-1.5 rounded-2xl border p-2 sm:flex-row sm:flex-nowrap sm:gap-1 sm:rounded-full"
            style={{
              borderColor: "var(--ds-color-neutral-border-subtle)",
              backgroundColor:
                "color-mix(in srgb, var(--ds-color-neutral-surface-default) 85%, transparent)",
              color: "var(--ds-color-neutral-text-subtle)",
              boxShadow: "var(--ds-shadow-lg)",
            }}
          >
            {MODES.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                aria-controls="edge-network-panel"
                className="w-full cursor-pointer rounded-xl px-3 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-color-accent-border-default)] data-[state=active]:shadow-[var(--ds-shadow-md)] data-[state=active]:ring-1 data-[state=active]:ring-[color:var(--ds-color-neutral-border-subtle)] bg-[color:var(--ds-color-neutral-surface-default)] text-[color:var(--ds-color-neutral-text-subtle)] hover:bg-[color:var(--ds-color-neutral-surface-hover)] hover:text-[color:var(--ds-color-neutral-text-default)] data-[state=active]:bg-[color:var(--ds-color-neutral-surface-hover)] data-[state=active]:text-[color:var(--ds-color-neutral-text-default)] sm:flex-1 sm:min-w-0 sm:rounded-full sm:px-3 sm:py-2.5 sm:text-[0.55rem] sm:tracking-[0.12em] whitespace-normal leading-tight sm:whitespace-nowrap"
              >
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div
        id="edge-network-panel"
        role="tabpanel"
        aria-label="Nettverksvisualisering"
        className="flex flex-wrap items-center gap-4"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ds-color-neutral-text-subtle)]">
          <Switch id={cloudSwitchId} checked={cloudOnline} onCheckedChange={onCloudOnlineChange} />
          <label htmlFor={cloudSwitchId}>Skykobling</label>
          <Badge
            variant={cloudOnline ? "outline" : "destructive"}
            className="flex items-center gap-1.5"
            style={
              cloudOnline
                ? {
                    borderColor: "var(--ds-color-success-border-default)",
                    color: "var(--ds-color-success-text-default)",
                  }
                : {
                    backgroundColor: "var(--ds-color-danger-base-default)",
                    color: "var(--ds-color-danger-base-contrast-default)",
                  }
            }
          >
            {cloudOnline ? (
              <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {cloudOnline ? "Tilkoblet" : "Frakoblet"}
          </Badge>
        </div>
        {syncing && (
          <Badge
            variant="secondary"
            style={{
              backgroundColor: "var(--ds-color-neutral-surface-tinted)",
              color: "var(--ds-color-neutral-text-default)",
            }}
          >
            Synkroniserer...
          </Badge>
        )}
      </div>
    </div>

    <div className="mt-4 flex flex-wrap items-center gap-3">
      <label
        htmlFor={impairmentSliderId}
        className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--ds-color-neutral-text-subtle)]"
      >
        Pakketap
      </label>
      <div className="flex min-w-[160px] flex-1 items-center gap-3">
        <Slider
          id={impairmentSliderId}
          value={impairment}
          onValueChange={onImpairmentChange}
          min={0}
          max={90}
          step={1}
          className="accent-[var(--ds-color-warning-base-default)]"
        />
        <span className="text-xs font-semibold tabular-nums text-[color:var(--ds-color-neutral-text-default)]">
          {impairment}%
        </span>
      </div>
      {impairment > 50 && (
        <Badge
          variant="destructive"
          style={{
            backgroundColor: "var(--ds-color-danger-base-default)",
            color: "var(--ds-color-danger-base-contrast-default)",
          }}
        >
          Høyt tap
        </Badge>
      )}
    </div>
    <p className="mt-2 text-xs text-[color:var(--ds-color-neutral-text-subtle)]">
      Tips: Juster pakketapet oppover og bytt konfigurasjon for å se hvordan nettverket oppfører seg.
    </p>
  </div>
);

export default NetworkControls;
