import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { Screen } from "@/components/screen";
import { Separator } from "@/components/ui/separator";
import { findCurrentPlan } from "@/features/plan/access/current";
import { StoreEditForm } from "@/features/store/edit/form";
import { LogoutButton } from "@/features/store/edit/logout";
import { PlanSection } from "@/features/store/edit/plan";
import { findStoreByOwner } from "@/features/store/find";
import { StoreLink } from "@/features/store/link";
import { requireCurrentSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Tu tienda",
  robots: { index: false },
};

export default async function StoreEditPage() {
  const session = await requireCurrentSession();
  const store = await findStoreByOwner(session.user.id);

  if (store === null) {
    redirect("/new");
  }

  const { plan: currentPlan } = await findCurrentPlan(store.id);

  return (
    <Screen aside={<StoreLink handle={store.handle} />}>
      <Reveal className="flex flex-col gap-10">
        <h1 className="text-3xl">Tu tienda</h1>
        <StoreEditForm store={store} />
        <Separator />
        <PlanSection currentPlan={currentPlan} />
        <Separator />
        <LogoutButton />
      </Reveal>
    </Screen>
  );
}
