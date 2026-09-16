import type { ReactNode } from "react";

import { Logo } from "@/components/logo";

type ScreenProps = {
  children: ReactNode;
};

export function Screen({ children }: ScreenProps) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-8">
      <Logo />
      {children}
    </main>
  );
}
