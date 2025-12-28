"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";
import { MASTER_TIMELINE } from "@/lib/master";
import EdgeComputingVisualization from "@/components/master/EdgeComputingVisualization";

const MasterPage = () => {
  const startDate = useMemo(() => Date.parse(MASTER_TIMELINE.start), []);
  const endDate = useMemo(() => Date.parse(MASTER_TIMELINE.end), []);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const now = Date.now();
      const rawProgress = ((now - startDate) / (endDate - startDate)) * 100;
      const nextProgress = Number.isFinite(rawProgress)
        ? Math.min(100, Math.max(0, rawProgress))
        : 0;
      setProgress(nextProgress);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  return (
    <div
      className="min-h-screen pt-20 pb-12 px-4"
      style={{ backgroundColor: "var(--ds-color-neutral-background-default)" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <Card
            className="relative h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{
              padding: "1.5rem",
              backgroundColor:
                "color-mix(in srgb, var(--ds-color-neutral-background-default) 92%, transparent)",
              backgroundImage:
                "linear-gradient(140deg, color-mix(in srgb, var(--ds-color-accent-background-tinted) 55%, transparent), transparent 60%)",
              border: "2px solid var(--ds-color-neutral-border-strong)",
              boxShadow: "var(--ds-shadow-lg)",
            }}
          >
            <div className="flex h-full flex-col justify-center gap-4">
              <Heading data-size="lg" style={{ marginBottom: 0 }}>
                Masteroppgave
              </Heading>
              <Paragraph
                data-size="sm"
                style={{ margin: 0, color: "var(--ds-color-neutral-text-default)", fontWeight: 600 }}
              >
                Kort fortalt: Jeg tester hvor robust KubeEdge-nettverk er når edge-noder mister
                kontakten med skyen.
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
                Denne visualiseringen er min korte forklaring på hvordan trafikk flyter mellom
                CloudCore og edge-noder, og hva som skjer når vi justerer link-status og pakketap.
                Jeg bruker den for å vise forskjellene mellom Standard K8s, KubeEdge basis og
                KubeEdge mesh.
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
                I min oppgave betyr edge computing små, ressurs-svake noder nær datakilden som skal
                kunne kjøre lokale tjenester selv om forbindelsen til skyen er ustabil. Jeg bruker
                KubeEdge fordi det utvider Kubernetes ved å flytte deler av kontrollplanet nær edge,
                mens CloudCore er skykomponenten som synkroniserer status når forbindelsen tillater det.
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
                Med vanlig Kubernetes forventer noder stabil kontakt med kontrollplanet, så når
                CloudCore eller API-serveren faller ut kan noder desynkronisere, service-oppdagelse
                blir treg eller feil, og gjenoppretting tar tid. EdgeMesh er et mesh/overlay som gir
                edge-til-edge-ruting når skyen er nede, og jeg sammenligner derfor KubeEdge med og
                uten EdgeMesh mot en Kubernetes-baseline på OpenWrt-maskinvare under ustabile lenker.
              </Paragraph>
            </div>
          </Card>

          <Card
            className="relative h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150"
            style={{
              padding: "1.5rem",
              backgroundColor:
                "color-mix(in srgb, var(--ds-color-neutral-background-default) 92%, transparent)",
              backgroundImage:
                "linear-gradient(140deg, color-mix(in srgb, var(--ds-color-accent-surface-tinted) 45%, transparent), transparent 60%)",
              border: "2px solid var(--ds-color-neutral-border-strong)",
              boxShadow: "var(--ds-shadow-lg)",
            }}
          >
            <EdgeComputingVisualization />
          </Card>
        </div>

        <div className="mt-6 grid gap-6">
          <Card
            className="relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{
              padding: "1.5rem",
              backgroundColor:
                "color-mix(in srgb, var(--ds-color-neutral-background-default) 94%, transparent)",
              border: "2px solid var(--ds-color-neutral-border-strong)",
              boxShadow: "var(--ds-shadow-md)",
            }}
          >
            <Heading data-size="sm" style={{ marginBottom: "0.5rem" }}>
              Detaljer fra prosjektet
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
              Oppgaven er i samarbeid med FFI og handler om å evaluere nettverksrobusthet på
              OpenWrt-klasse rutere og små edge-enheter. Jeg kjører eksperimentelle benchmark-tester
              med MicroK8s/CloudCore og sammenligner tre oppsett: ren Kubernetes, KubeEdge uten
              EdgeMesh og KubeEdge med EdgeMesh. Målingene ser på pakketap, latens, throughput,
              gjenopprettingstid og ressursbruk når forbindelsen er ustabil.
            </Paragraph>
          </Card>

          <Card
            className="relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150"
            style={{
              padding: "1.5rem",
              backgroundColor:
                "color-mix(in srgb, var(--ds-color-neutral-background-default) 94%, transparent)",
              border: "2px solid var(--ds-color-neutral-border-strong)",
              boxShadow: "var(--ds-shadow-md)",
            }}
          >
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
                style={{
                  width: `${progress}%`,
                  backgroundColor: "var(--ds-color-accent-base-default)",
                }}
              />
            </div>
            <Paragraph data-size="xs" style={{ margin: "0.5rem 0 0", color: "var(--ds-color-neutral-text-default)" }}>
              Basert på tidslinjen fra {MASTER_TIMELINE.start.split("T")[0]} til{" "}
              {MASTER_TIMELINE.end.split("T")[0]}.
            </Paragraph>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MasterPage;
