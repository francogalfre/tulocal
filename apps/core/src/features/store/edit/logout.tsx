"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { signOut } from "@tulocal/authentication/client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(): void {
    startTransition(async () => {
      await signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      size="xl"
      variant="ghost"
      className="text-muted-foreground"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? <Spinner data-icon="inline-start" /> : null}
      {isPending ? "Cerrando sesión" : "Cerrar sesión"}
    </Button>
  );
}
