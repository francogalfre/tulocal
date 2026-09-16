import { redirect } from "next/navigation";

import { Screen } from "@/components/screen";
import { GoogleSignIn } from "@/features/landing/google";
import { findCurrentSession } from "@/lib/session";

export default async function LandingPage() {
  const session = await findCurrentSession();

  if (session !== null) {
    redirect("/new");
  }

  return (
    <Screen>
      <div className="flex flex-1 flex-col justify-center gap-4">
        <h1 className="text-3xl text-balance">una foto y ya estás vendiendo</h1>
        <p className="text-muted-foreground">
          Entrás con Google y tu tienda existe. Subís la foto de lo que vendés y la IA escribe la
          publicación, mejora las fotos y te sugiere un precio.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <GoogleSignIn />
        <p className="text-center text-sm text-muted-foreground">gratis, sin comisión</p>
      </div>
    </Screen>
  );
}
