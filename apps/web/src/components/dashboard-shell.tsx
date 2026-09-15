"use client";

import { Button } from "@tulocal/ui/components/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          tulocal
        </Link>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut data-icon="inline-start" />
          Salir
        </Button>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
