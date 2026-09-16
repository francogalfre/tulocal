import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Features } from "@/features/landing/features";
import { Footer } from "@/features/landing/footer";
import { GoogleSignIn } from "@/features/landing/google";
import { Hero } from "@/features/landing/hero";
import { SmoothScroll } from "@/features/landing/scroll";
import { Sponsors } from "@/features/landing/sponsors";
import { findStoreEntry } from "@/features/store/find";
import { findCurrentSession } from "@/lib/session";

export const metadata: Metadata = {
  title: { absolute: "tulocal" },
  description:
    "Una foto y ya estás vendiendo. Entrás con Google, subís la foto y la IA arma la publicación, la publica y negocia por vos.",
};

async function findSignedInStorePath(ownerId: string): Promise<string> {
  const entry = await findStoreEntry(ownerId);

  if (entry === null || !entry.hasProducts) {
    return "/new";
  }

  return `/${entry.handle}`;
}

export default async function LandingPage() {
  const session = await findCurrentSession();
  const signedInStorePath = session !== null ? await findSignedInStorePath(session.user.id) : null;

  return (
    <SmoothScroll>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col lg:border-x">
        <main className="flex flex-1 flex-col pt-6">
          <header className="flex h-12 items-center justify-between px-6 mb-6">
            <Logo />
            {signedInStorePath !== null ? (
              <Button
                size="lg"
                className="px-4"
                render={<Link href={signedInStorePath} />}
                nativeButton={false}
              >
                Mi local
              </Button>
            ) : (
              <GoogleSignIn
                label="Entrar con Google"
                variant="outline"
                size="lg"
                className="px-4"
              />
            )}
          </header>

          <div className="flex flex-1 flex-col motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:ease-out">
            <Hero signedInStorePath={signedInStorePath} />
            <Features />
            <Sponsors />
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}
