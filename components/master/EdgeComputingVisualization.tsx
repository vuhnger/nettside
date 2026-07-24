"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { createNodes } from "./edge/config";
import NetworkControls from "./edge/NetworkControls";
import NetworkMap from "./edge/NetworkMap";
import { buildParticles, clamp } from "./edge/particles";
import type { EdgeNode, Mode, NodeId } from "./edge/types";

const EdgeComputingVisualization = () => {
  const [mode, setMode] = useState<Mode>("k8s");
  const [cloudOnline, setCloudOnline] = useState(true);
  const [impairment, setImpairment] = useState(20);
  const [syncing, setSyncing] = useState(false);
  const glowId = useId().replace(/:/g, "");
  const cloudSwitchId = useId();
  const impairmentSliderId = useId();

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

  // Vis en kort "synkroniserer"-tilstand når skyen kommer tilbake på nett.
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

  const nodes = useMemo(
    () => createNodes(mapSize.width, mapSize.height),
    [mapSize.width, mapSize.height],
  );
  const nodeById = useMemo(() => {
    const record = new Map<NodeId, EdgeNode>();
    nodes.forEach((node) => record.set(node.id, node));
    return record;
  }, [nodes]);

  const cloudLinesActive = cloudOnline;
  const meshLinesActive = mode === "edgemesh";
  const flowCloud =
    cloudOnline && !syncing && (mode === "k8s" || mode === "kubeedge" || mode === "edgemesh");
  const flowMesh = mode === "edgemesh" && !syncing;
  const lossLevel = impairment > 50;
  const lossDropChance = lossLevel ? clamp((impairment - 50) / 50, 0, 1) : 0;

  const particles = useMemo(
    () => buildParticles({ flowCloud, flowMesh, impairmentFactor, lossLevel, lossDropChance }),
    [flowCloud, flowMesh, impairmentFactor, lossLevel, lossDropChance],
  );

  return (
    <div className="flex flex-col gap-4 text-[color:var(--ds-color-neutral-text-default)]">
      <NetworkControls
        mode={mode}
        onModeChange={setMode}
        cloudOnline={cloudOnline}
        onCloudOnlineChange={setCloudOnline}
        impairment={impairment}
        onImpairmentChange={setImpairment}
        syncing={syncing}
        cloudSwitchId={cloudSwitchId}
        impairmentSliderId={impairmentSliderId}
      />
      <NetworkMap
        mapRef={mapRef}
        mapSize={mapSize}
        nodes={nodes}
        nodeById={nodeById}
        particles={particles}
        cloudOnline={cloudOnline}
        mode={mode}
        cloudLinesActive={cloudLinesActive}
        meshLinesActive={meshLinesActive}
        flowCloud={flowCloud}
        flowMesh={flowMesh}
        glowId={glowId}
      />
    </div>
  );
};

export default EdgeComputingVisualization;
