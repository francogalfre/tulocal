import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-6 py-6 sm:px-12 sm:py-8">
      <header>
        <Link
          href="/"
          aria-label="tutienda"
          className="inline-flex rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <BrandLogo />
        </Link>
      </header>
      <main className="flex w-full max-w-[440px] flex-1 flex-col pt-16 pb-12 sm:pt-24">
        {children}
      </main>
    </div>
  );
}
