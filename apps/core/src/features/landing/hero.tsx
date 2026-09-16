import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GoogleSignIn } from "@/features/landing/google";
import { HeroBackground } from "@/features/landing/hero-background";

const YCOMBINATOR_URL = "https://www.ycombinator.com";

type HeroProps = {
  signedInStorePath: string | null;
};

export function Hero({ signedInStorePath }: HeroProps) {
  return (
    <section>
      <HeroBackground>
        <div className="flex flex-col items-start gap-8 px-6 pt-24 pb-24 sm:pt-32 sm:pb-32">
          <a
            href={YCOMBINATOR_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Image
              src="/landing/ycombinator.svg"
              alt=""
              width={14}
              height={14}
              className="shrink-0"
            />
            Not backed by YCombinator
          </a>
          <div className="flex flex-col gap-5">
            <h1 className="text-5xl sm:text-6xl tracking-tight">Una foto y ya estás vendiendo</h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Sacás la foto de lo que vendés y la IA arma la publicación: fotos mejores, título,
              descripción y precio sugerido. Tu tienda queda con su propio link, su QR y un agente
              que atiende y negocia por vos.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {signedInStorePath !== null ? (
              <Button size="xl" render={<Link href={signedInStorePath} />} nativeButton={false}>
                Ir a mi local
              </Button>
            ) : (
              <GoogleSignIn label="Comenzá a vender" size="xl" showsGoogleMark={false} />
            )}
            <Button
              variant="outline"
              size="xl"
              render={<Link href="#como-funciona" />}
              nativeButton={false}
            >
              Ver cómo funciona
            </Button>
          </div>
        </div>
      </HeroBackground>
      <Image
        src="/landing/hero-illustration.webp"
        alt=""
        width={1200}
        height={630}
        priority
        fetchPriority="high"
        sizes="(max-width: 896px) 100vw, 896px"
        className="h-auto w-full object-cover object-center"
      />
    </section>
  );
}
