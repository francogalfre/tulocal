import type { ReactNode } from "react";

import { Logo } from "@/components/logo";

type ScreenProps = {
  children: ReactNode;
  aside?: ReactNode;
};

export function Screen({ children, aside }: ScreenProps) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-5 pt-6 pb-12">
      <header className="flex h-8 items-center justify-between">
        <Logo />
        {aside}
      </header>
      <div className="flex flex-1 flex-col gap-10">{children}</div>
    </main>
  );
}
