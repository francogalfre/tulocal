import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Logo } from "@/components/logo";
import { requireSuperadminSession } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Superadmin",
  robots: { index: false },
};

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireSuperadminSession();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-5 pt-6 pb-16">
      <header className="flex h-9 items-center justify-between">
        <Logo />
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          Superadmin
        </span>
      </header>
      {children}
    </main>
  );
}
