import type { Metadata } from "next";
import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";
import { MASTER_TIMELINE } from "@/lib/master";
import EdgeComputingVisualization from "@/components/master/EdgeComputingVisualization";
import MasterProgress from "@/components/master/MasterProgress";

export const metadata: Metadata = {
  title: "Master",
  description:
    "Om masteroppgaven min i programmering og systemarkitektur ved Universitetet i Oslo - tema, fremdrift og tidslinje.",
};

const MasterPage = () => {
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
            <MasterProgress start={MASTER_TIMELINE.start} end={MASTER_TIMELINE.end} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MasterPage;
