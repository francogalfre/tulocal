import { Badge } from "@tulocal/ui/components/badge";

export const KIND_LABELS = {
  original: "Original",
  studio: "Estudio",
  lifestyle: "Ambiente",
  enhanced: "Mejorada",
  hero: "Destacada",
} as const;

export function ImageBadge({
  kind,
  fidelityPassed,
}: {
  kind: keyof typeof KIND_LABELS;
  fidelityPassed: boolean | null;
}) {
  return (
    <div className="absolute bottom-1 left-1 flex gap-1">
      <Badge variant="secondary">{KIND_LABELS[kind]}</Badge>
      {fidelityPassed === false && <Badge variant="destructive">No verificada</Badge>}
      {fidelityPassed === true && <Badge>Verificada</Badge>}
    </div>
  );
}
