import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { InView } from "@/components/motion/inview";
import { Faq } from "@/features/landing/faq";
import { Features } from "@/features/landing/features";
import { Footer } from "@/features/landing/footer";
import { GoogleSignIn } from "@/features/landing/google";
import { Hero } from "@/features/landing/hero";
import { Pricing } from "@/features/landing/pricing";
import { SmoothScroll } from "@/features/landing/scroll";
import { Sponsors } from "@/features/landing/sponsors";
import { findStoreEntry } from "@/features/store/find";
import { findCurrentSession } from "@/lib/session";

export const metadata: Metadata = {
  title: { absolute: "tulocal · Tu tienda online gratis, vendé en un click" },
  description:
    "Creá tu tienda online gratis con una sola foto: la IA arma la publicación, sugiere el precio y un agente negocia con tus compradores por vos.",
  alternates: { canonical: "/" },
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
          <header className="flex h-9 items-center justify-between px-6 mb-6">
            <Logo />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="lg"
                className="px-3"
                render={<Link href="/stores" />}
                nativeButton={false}
              >
                Ver tiendas
              </Button>
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
            </div>
          </header>

          <div className="flex flex-1 flex-col">
            <InView>
              <Hero signedInStorePath={signedInStorePath} />
            </InView>
            <Sponsors />
            <Features />
            <Pricing signedInStorePath={signedInStorePath} />
            <Faq />
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}
