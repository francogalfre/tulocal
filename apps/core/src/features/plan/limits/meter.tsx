import Link from "next/link";

import { Progress, ProgressLabel } from "@/components/ui/progress";
import type { ProductUsage } from "@/features/plan/limits/usage";

type MeterProps = {
  usage: ProductUsage;
  showsPlansLink: boolean;
};

function describeUsage(usage: ProductUsage): string {
  if (usage.isProductLimitLifetime) {
    return `Usaste ${usage.usedProducts} de tus ${usage.productLimit} productos gratis`;
  }

  return `Tenés ${usage.usedProducts} de ${usage.productLimit} productos`;
}

export function Meter({ usage, showsPlansLink }: MeterProps) {
  return (
    <Progress
      value={Math.min(usage.usedProducts, usage.productLimit)}
      max={usage.productLimit}
      className="gap-2"
    >
      <ProgressLabel className="numeric text-[13px]">{describeUsage(usage)}</ProgressLabel>
      {showsPlansLink ? (
        <Link
          href="/plans"
          className="ml-auto text-[13px] font-medium text-brand-deep underline-offset-4 hover:underline"
        >
          Ver planes
        </Link>
      ) : null}
    </Progress>
  );
}
