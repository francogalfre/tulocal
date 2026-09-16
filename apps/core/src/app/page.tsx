import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Features } from "@/features/landing/features";
import { Footer } from "@/features/landing/footer";
import { GoogleSignIn } from "@/features/landing/google";
import { Hero } from "@/features/landing/hero";
import { SmoothScroll } from "@/features/landing/scroll";
import { Sponsors } from "@/features/landing/sponsors";
import { findStoreByOwner, hasAnyProduct } from "@/features/store/find";
import { findCurrentSession } from "@/lib/session";

async function findSignedInStorePath(ownerId: string): Promise<string> {
  const store = await findStoreByOwner(ownerId);

  if (store === null) {
    return "/new";
  }

  const hasProducts = await hasAnyProduct(store.id);

  return hasProducts ? `/${store.handle}` : "/new";
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
                Mi tienda
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
