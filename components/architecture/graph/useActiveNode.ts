"use client";

import { useMemo, useState } from "react";

import type { LayoutEdge } from "@/lib/architecture-layout";

/**
 * Hvilken fil som er markert, og hva den henger sammen med.
 *
 * Naboene regnes i begge retninger: peker man på en fil vil man se både hva den
 * importerer og hvem som importerer den, ikke bare den ene halvparten.
 */
export function useActiveNode(edges: readonly LayoutEdge[]) {
  const [active, setActive] = useState<string | null>(null);

  const neighbours = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const link = (from: string, to: string) => {
      if (!map.has(from)) map.set(from, new Set());
      map.get(from)?.add(to);
    };
    for (const edge of edges) {
      link(edge.from, edge.to);
      link(edge.to, edge.from);
    }
    return map;
  }, [edges]);

  /** null betyr at ingenting er markert, altså at alt skal vises likt. */
  const activeSet = useMemo(
    () => (active ? new Set([active, ...(neighbours.get(active) ?? [])]) : null),
    [active, neighbours],
  );

  return { active, activeSet, setActive };
}
