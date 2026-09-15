"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { type CreatedStore, CreateStoreForm } from "@/app/onboarding/create-store-form";
import { StoreCreated } from "@/app/onboarding/store-created";
import { Screen } from "@/components/screen";
import { ScreenLoading } from "@/components/screen-loading";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export function OnboardingScreen() {
  const router = useRouter();
  const session = authClient.useSession();
  const [createdStore, setCreatedStore] = useState<CreatedStore | null>(null);
  const existingStore = useQuery({
    ...trpc.store.getMine.queryOptions(),
    enabled: session.data !== null && session.data !== undefined && createdStore === null,
  });

  useEffect(() => {
    if (!session.isPending && !session.data) router.replace("/login");
  }, [session.isPending, session.data, router]);

  useEffect(() => {
    if (createdStore === null && existingStore.data) router.replace("/dashboard");
  }, [createdStore, existingStore.data, router]);

  if (createdStore) {
    return (
      <Screen>
        <StoreCreated store={createdStore} />
      </Screen>
    );
  }

  if (!session.data || existingStore.isPending || existingStore.data) {
    return <ScreenLoading />;
  }

  return (
    <Screen>
      <CreateStoreForm onCreated={setCreatedStore} />
    </Screen>
  );
}
