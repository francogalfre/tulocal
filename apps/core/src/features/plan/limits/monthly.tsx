import { Progress, ProgressLabel } from "@/components/ui/progress";
import type { SceneUsage } from "@/features/plan/limits/scenes";
import type { MonthlyCreationUsage } from "@/features/plan/limits/usage";

type MonthlyUsageProps = {
  creationUsage: MonthlyCreationUsage | null;
  sceneUsage: SceneUsage;
};

type UsageBarProps = {
  used: number;
  limit: number;
  label: string;
};

function UsageBar({ used, limit, label }: UsageBarProps) {
  return (
    <Progress value={Math.min(used, limit)} max={limit} className="gap-2">
      <ProgressLabel className="numeric text-[13px]">
        {label}: {used} de {limit}
      </ProgressLabel>
    </Progress>
  );
}

export function MonthlyUsage({ creationUsage, sceneUsage }: MonthlyUsageProps) {
  if (creationUsage === null && sceneUsage.monthlySceneLimit === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {creationUsage !== null ? (
        <UsageBar
          used={creationUsage.createdThisMonth}
          limit={creationUsage.monthlyCreationLimit}
          label="Productos nuevos este mes"
        />
      ) : null}
      {sceneUsage.monthlySceneLimit > 0 ? (
        <UsageBar
          used={sceneUsage.generatedThisMonth}
          limit={sceneUsage.monthlySceneLimit}
          label="Escenas con IA este mes"
        />
      ) : null}
    </div>
  );
}
