"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cloud, Router, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Mode = "k8s" | "kubeedge" | "edgemesh";
type NodeId = "cloud" | "edge-a" | "edge-b" | "edge-c";

type Node = {
  id: NodeId;
  label: string;
  type: "cloud" | "edge";
  position: { x: number; y: number };
};

type Link = {
  id: string;
  from: NodeId;
  to: NodeId;
  kind: "cloud" | "mesh";
};

type Particle = {
  id: string;
  from: NodeId;
  to: NodeId;
  duration: number;
  delay: number;
  dropAt: number | null;
  stutter: boolean;
  color: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const MODES: { value: Mode; label: string; shortLabel: string }[] = [
  { value: "k8s", label: "Standard K8s", shortLabel: "K8s" },
  { value: "kubeedge", label: "KubeEdge basis", shortLabel: "KubeEdge" },
  { value: "edgemesh", label: "KubeEdge mesh", shortLabel: "EdgeMesh" },
];

const EdgeComputingVisualization = () => {
  const [mode, setMode] = useState<Mode>("k8s");
  const [cloudOnline, setCloudOnline] = useState(true);
  const [impairment, setImpairment] = useState(20);
  const [syncing, setSyncing] = useState(false);
  const glowId = useId().replace(/:/g, "");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const cloudPrevRef = useRef(cloudOnline);

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setMapSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!cloudPrevRef.current && cloudOnline) {
      cloudPrevRef.current = cloudOnline;
      setSyncing(true);
      const timer = setTimeout(() => setSyncing(false), 2000);
      return () => clearTimeout(timer);
    }
    cloudPrevRef.current = cloudOnline;
    return undefined;
  }, [cloudOnline]);

  const impairmentFactor = impairment / 100;

  const nodes = useMemo<Node[]>(() => {
    const width = mapSize.width || 1;
    const height = mapSize.height || 1;
    const compact = width < 420;
    const topY = height * (compact ? 0.18 : 0.16);
    const edgeY = height * (compact ? 0.7 : 0.68);
    const bottomY = height * (compact ? 0.86 : 0.84);

    return [
      {
        id: "cloud",
        label: "CloudCore",
        type: "cloud",
        position: { x: width * 0.5, y: topY },
      },
      {
        id: "edge-a",
        label: "OpenWrt-ruter",
        type: "edge",
        position: { x: width * 0.2, y: edgeY },
      },
      {
        id: "edge-b",
        label: "OpenWrt-ruter",
        type: "edge",
        position: { x: width * 0.8, y: edgeY },
      },
      {
        id: "edge-c",
        label: "OpenWrt-ruter",
        type: "edge",
        position: { x: width * 0.5, y: bottomY },
      },
    ];
  }, [mapSize.height, mapSize.width]);

  const nodeById = useMemo(() => {
    const record = new Map<NodeId, Node>();
    nodes.forEach((node) => record.set(node.id, node));
    return record;
  }, [nodes]);

  const links = useMemo<Link[]>(() => {
    const cloudLinks: Link[] = [
      { id: "cloud-a", from: "cloud", to: "edge-a", kind: "cloud" },
      { id: "cloud-b", from: "cloud", to: "edge-b", kind: "cloud" },
      { id: "cloud-c", from: "cloud", to: "edge-c", kind: "cloud" },
    ];
    const meshLinks: Link[] = [
      { id: "mesh-ab", from: "edge-a", to: "edge-b", kind: "mesh" },
      { id: "mesh-bc", from: "edge-b", to: "edge-c", kind: "mesh" },
      { id: "mesh-ca", from: "edge-c", to: "edge-a", kind: "mesh" },
    ];
    return [...cloudLinks, ...meshLinks];
  }, []);

  const cloudLinesActive = cloudOnline;
  const meshLinesActive = mode === "edgemesh";
  const flowCloud =
    cloudOnline &&
    !syncing &&
    (mode === "k8s" || mode === "kubeedge" || mode === "edgemesh");
  const flowMesh = mode === "edgemesh" && !syncing;
  const lossLevel = impairment > 50;
  const lossDropChance = lossLevel ? clamp((impairment - 50) / 50, 0, 1) : 0;

  const particles = useMemo<Particle[]>(() => {
    const activeLinks = links.filter((link) => {
      if (link.kind === "cloud") return flowCloud;
      return flowMesh;
    });

    const result: Particle[] = [];
    activeLinks.forEach((link) => {
      const baseDuration = link.kind === "mesh" ? 1.2 : 1.8;
      const duration = baseDuration + impairmentFactor * 0.6;
      const particleCount = link.kind === "mesh" ? 4 : 5;
      const directions: NodeId[][] = [
        [link.from, link.to],
        [link.to, link.from],
      ];

      for (let i = 0; i < particleCount; i += 1) {
        const [from, to] = directions[i % directions.length];
        const dropAt =
          lossDropChance > 0 && Math.random() < lossDropChance
            ? 0.4 + Math.random() * 0.3
            : null;
        result.push({
          id: `${link.id}-${i}`,
          from,
          to,
          duration,
          delay: (i * 0.22) % 1.1,
          dropAt,
          stutter: lossLevel,
          color: link.kind === "mesh" ? "rgba(251, 191, 36, 0.9)" : "rgba(59, 130, 246, 0.9)",
        });
      }
    });

    return result;
  }, [flowCloud, flowMesh, impairmentFactor, lossDropChance, lossLevel, links]);


  const buildProgressFrames = (stutter: boolean) => {
    if (!stutter) {
      return { values: [0, 1], times: [0, 1] };
    }
    const values = [0, 0.12, 0.12, 0.3, 0.3, 0.52, 0.52, 0.72, 0.72, 1];
    const times = values.map((_, index) => index / (values.length - 1));
    return { values, times };
  };

  return (
    <div className="flex flex-col gap-4 text-slate-900 dark:text-slate-100">
      <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-lg dark:border-slate-800/70 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
              <TabsList className="flex h-auto w-full max-w-[640px] flex-col gap-1.5 rounded-2xl border border-slate-200/80 bg-white/80 p-2 text-slate-600 shadow-[0_8px_22px_rgba(15,23,42,0.12)] dark:border-slate-600/70 dark:bg-slate-950/80 dark:text-slate-200 dark:shadow-[0_8px_22px_rgba(3,7,18,0.6)] sm:flex-row sm:flex-nowrap sm:gap-1 sm:rounded-full">
                {MODES.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="w-full cursor-pointer rounded-xl bg-white/70 px-3 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-lg data-[state=active]:ring-1 data-[state=active]:ring-slate-200/80 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white dark:data-[state=active]:ring-slate-500/70 sm:flex-1 sm:min-w-0 sm:rounded-full sm:px-3 sm:py-2.5 sm:text-[0.55rem] sm:tracking-[0.12em] whitespace-normal leading-tight sm:whitespace-nowrap"
                  >
                    <span className="sm:hidden">{item.shortLabel}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
              <Switch checked={cloudOnline} onCheckedChange={setCloudOnline} />
              Skykobling
              <Badge
                variant={cloudOnline ? "outline" : "destructive"}
                className={cn(
                  "flex items-center gap-1.5",
                  cloudOnline
                    ? "border-emerald-400/60 text-emerald-700 dark:border-emerald-400/50 dark:text-emerald-100"
                    : "bg-red-500/90 text-white"
                )}
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
                className="bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
              >
                Synkroniserer...
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
            Pakketap
          </span>
          <div className="flex min-w-[160px] flex-1 items-center gap-3">
            <Slider
              value={impairment}
              onValueChange={setImpairment}
              min={0}
              max={90}
              step={1}
              className="accent-amber-400"
            />
            <span className="text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">
              {impairment}%
            </span>
          </div>
          {impairment > 50 && (
            <Badge variant="destructive" className="bg-red-500/90 text-white">
              Høyt tap
            </Badge>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Tips: Juster pakketapet oppover og bytt konfigurasjon for å se hvordan nettverket oppfører seg.
        </p>
      </div>

      <div className="grid gap-4">
        <div
          ref={mapRef}
          className="relative h-[320px] rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xl [--edge-grid-color:rgba(148,163,184,0.35)] dark:border-slate-800/70 dark:bg-slate-900/95 dark:[--edge-grid-color:rgba(30,41,59,0.6)]"
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
            {links.map((link) => {
              const from = nodeById.get(link.from);
              const to = nodeById.get(link.to);
              if (!from || !to) return null;
              const isCloud = link.kind === "cloud";
              const isMesh = link.kind === "mesh";
              const show = isCloud ? cloudLinesActive : meshLinesActive;
              const stroke = isCloud
                ? cloudOnline
                  ? "rgba(59, 130, 246, 0.85)"
                  : "rgba(239, 68, 68, 0.7)"
                : "rgba(251, 191, 36, 0.85)";
              return (
                <motion.line
                  key={link.id}
                  x1={from.position.x}
                  y1={from.position.y}
                  x2={to.position.x}
                  y2={to.position.y}
                  stroke={stroke}
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

            {links.map((link) => {
              const from = nodeById.get(link.from);
              const to = nodeById.get(link.to);
              if (!from || !to) return null;
              const isCloud = link.kind === "cloud";
              const show = isCloud ? flowCloud : flowMesh;
              if (!show) return null;
              const stroke = isCloud
                ? "rgba(96, 165, 250, 0.9)"
                : "rgba(251, 191, 36, 0.9)";
              return (
                <motion.line
                  key={`${link.id}-flow`}
                  x1={from.position.x}
                  y1={from.position.y}
                  x2={to.position.x}
                  y2={to.position.y}
                  stroke={stroke}
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
                (progress) =>
                  from.position.x + (to.position.x - from.position.x) * progress
              );
              const cy = values.map(
                (progress) =>
                  from.position.y + (to.position.y - from.position.y) * progress
              );
              const opacityValues = particle.dropAt
                ? [0, 1, 1, 0, 0]
                : [0.35, 1, 1, 0.25];
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
                ? "text-blue-600 dark:text-blue-500"
                : "text-red-600 dark:text-red-500"
              : isError
              ? "text-red-600 dark:text-red-500"
              : "text-emerald-600 dark:text-emerald-500";
            const labelTone = isError ? "text-red-600 dark:text-red-200" : "text-slate-700 dark:text-slate-200";

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
                      "flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 shadow-md dark:border-slate-700/60 dark:bg-slate-950/70 dark:shadow-lg",
                      nodeTone
                    )}
                  >
                    {isCloud ? (
                      <Cloud className="h-6 w-6" />
                    ) : (
                      <Router className="h-6 w-6" />
                    )}
                  </div>
                  <div className={cn("text-[0.6rem] font-semibold uppercase tracking-[0.18em]", labelTone)}>
                    {node.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default EdgeComputingVisualization;
