import { Camera, Sparkles, Store } from "lucide-react";
import { redirect } from "next/navigation";

import { Screen } from "@/components/screen";
import { GoogleSignIn } from "@/features/landing/google";
import { findCurrentSession } from "@/lib/session";

const STEPS = [
  { icon: Camera, title: "Sacás una foto", detail: "Hasta tres, desde el celular." },
  {
    icon: Sparkles,
    title: "La IA arma la publicación",
    detail: "Fotos mejoradas, texto y precio sugerido.",
  },
  { icon: Store, title: "Compartís tu tienda", detail: "Un link y un QR. Sin comisión." },
];

export default async function LandingPage() {
  const session = await findCurrentSession();

  if (session !== null) {
    redirect("/new");
  }

  return (
    <Screen>
      <div className="flex flex-1 flex-col justify-center gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="text-[2.5rem] leading-[1.05]">Una foto y ya estás vendiendo</h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Entrás con Google y tu tienda ya existe. Subís la foto de lo que vendés y la IA hace el
            resto.
          </p>
        </div>
        <ol className="flex flex-col gap-5">
          {STEPS.map((step) => (
            <li key={step.title} className="flex items-start gap-4">
              <step.icon className="mt-0.5 size-5 shrink-0 text-brand-deep" aria-hidden="true" />
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{step.title}</span>
                <span className="text-sm text-muted-foreground">{step.detail}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-3">
        <GoogleSignIn />
        <p className="text-center text-sm text-muted-foreground">Gratis, sin comisión.</p>
      </div>
    </Screen>
  );
}
