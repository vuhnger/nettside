import { motion } from "framer-motion";
import { Cloud, Router } from "lucide-react";
import type { RefObject } from "react";

import { cn } from "@/lib/utils";

import { LINKS } from "./config";
import { buildProgressFrames } from "./particles";
import type { EdgeNode, Mode, NodeId, Particle } from "./types";

type NetworkMapProps = {
  mapRef: RefObject<HTMLDivElement | null>;
  mapSize: { width: number; height: number };
  nodes: EdgeNode[];
  nodeById: Map<NodeId, EdgeNode>;
  particles: Particle[];
  cloudOnline: boolean;
  mode: Mode;
  cloudLinesActive: boolean;
  meshLinesActive: boolean;
  flowCloud: boolean;
  flowMesh: boolean;
  glowId: string;
};

/** SVG-kartet: lenker, animerte flytlinjer og pakker, med node-markørene oppå. */
const NetworkMap = ({
  mapRef,
  mapSize,
  nodes,
  nodeById,
  particles,
  cloudOnline,
  mode,
  cloudLinesActive,
  meshLinesActive,
  flowCloud,
  flowMesh,
  glowId,
}: NetworkMapProps) => (
  <div className="grid gap-4">
    <div
      ref={mapRef}
      className="relative h-[320px] rounded-2xl border p-4 shadow-[var(--ds-shadow-xl)] [--edge-grid-color:color-mix(in_srgb,var(--ds-color-neutral-border-subtle)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_92%,transparent)] border-[color:var(--ds-color-neutral-border-subtle)]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--edge-grid-color) 1px, transparent 1px), linear-gradient(var(--edge-grid-color) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${mapSize.width || 1} ${mapSize.height || 1}`}
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={`${glowId}-particle`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {LINKS.map((link) => {
          const from = nodeById.get(link.from);
          const to = nodeById.get(link.to);
          if (!from || !to) return null;
          const isCloud = link.kind === "cloud";
          const isMesh = link.kind === "mesh";
          const show = isCloud ? cloudLinesActive : meshLinesActive;
          const stroke = isCloud
            ? cloudOnline
              ? "var(--ds-color-accent-base-default)"
              : "var(--ds-color-danger-base-default)"
            : "var(--ds-color-warning-base-default)";
          const strokeOpacity = isCloud ? (cloudOnline ? 0.85 : 0.7) : 0.85;
          return (
            <motion.line
              key={link.id}
              x1={from.position.x}
              y1={from.position.y}
              x2={to.position.x}
              y2={to.position.y}
              stroke={stroke}
              strokeOpacity={strokeOpacity}
              strokeWidth={isMesh ? 1.6 : 2}
              strokeDasharray={isMesh ? "6 6" : "0"}
              strokeLinecap="round"
              strokeDashoffset={isMesh && show ? 0 : undefined}
              initial={{ opacity: 0 }}
              animate={
                isMesh && show
                  ? { opacity: 1, strokeDashoffset: [0, -12] }
                  : { opacity: show ? 1 : 0 }
              }
              transition={
                isMesh && show
                  ? { duration: 2, repeat: Infinity, ease: "linear" }
                  : { duration: 0.4 }
              }
            />
          );
        })}

        {LINKS.map((link) => {
          const from = nodeById.get(link.from);
          const to = nodeById.get(link.to);
          if (!from || !to) return null;
          const isCloud = link.kind === "cloud";
          const show = isCloud ? flowCloud : flowMesh;
          if (!show) return null;
          const stroke = isCloud
            ? "var(--ds-color-accent-base-hover)"
            : "var(--ds-color-warning-base-default)";
          return (
            <motion.line
              key={`${link.id}-flow`}
              x1={from.position.x}
              y1={from.position.y}
              x2={to.position.x}
              y2={to.position.y}
              stroke={stroke}
              strokeOpacity={0.9}
              strokeWidth={1.4}
              strokeDasharray={isCloud ? "4 10" : "3 8"}
              strokeLinecap="round"
              initial={{ opacity: 0.2 }}
              animate={{ strokeDashoffset: [0, -24], opacity: [0.2, 0.75, 0.2] }}
              transition={{ duration: isCloud ? 2.4 : 1.8, ease: "linear", repeat: Infinity }}
            />
          );
        })}

        {particles.map((particle) => {
          const from = nodeById.get(particle.from);
          const to = nodeById.get(particle.to);
          if (!from || !to) return null;
          const { values, times } = buildProgressFrames(particle.stutter);
          const cx = values.map(
            (progress) => from.position.x + (to.position.x - from.position.x) * progress,
          );
          const cy = values.map(
            (progress) => from.position.y + (to.position.y - from.position.y) * progress,
          );
          const opacityValues = particle.dropAt ? [0, 1, 1, 0, 0] : [0.35, 1, 1, 0.25];
          const opacityTimes = particle.dropAt
            ? [0, 0.1, particle.dropAt, particle.dropAt + 0.05, 1]
            : [0, 0.1, 0.9, 1];

          return (
            <motion.circle
              key={particle.id}
              r={4.5}
              fill={particle.color}
              filter={`url(#${glowId}-particle)`}
              initial={{ opacity: 0, cx: cx[0], cy: cy[0] }}
              animate={{ opacity: opacityValues, cx, cy }}
              transition={{
                duration: particle.duration,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
                delay: particle.delay,
                times,
                opacity: { times: opacityTimes },
              }}
            />
          );
        })}
      </svg>

      {nodes.map((node) => {
        const isCloud = node.type === "cloud";
        const isError = !cloudOnline && mode === "k8s" && node.type === "edge";
        const nodeTone = isCloud
          ? cloudOnline
            ? "text-[color:var(--ds-color-accent-base-default)]"
            : "text-[color:var(--ds-color-danger-base-default)]"
          : isError
            ? "text-[color:var(--ds-color-danger-base-default)]"
            : "text-[color:var(--ds-color-success-base-default)]";
        const labelTone = isError
          ? "text-[color:var(--ds-color-danger-text-default)]"
          : "text-[color:var(--ds-color-neutral-text-subtle)]";

        return (
          <motion.div
            key={node.id}
            layout
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: node.position.x, top: node.position.y }}
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_92%,transparent)] shadow-[var(--ds-shadow-md)] border-[color:var(--ds-color-neutral-border-subtle)]",
                  nodeTone,
                )}
              >
                {isCloud ? <Cloud className="h-6 w-6" /> : <Router className="h-6 w-6" />}
              </div>
              <div
                className={cn("text-[0.6rem] font-semibold uppercase tracking-[0.18em]", labelTone)}
              >
                {node.label}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default NetworkMap;
