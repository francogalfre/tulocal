import { Button } from "@tulocal/ui/components/button";
import { Camera, MessageCircle, QrCode, Sparkles } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: Camera,
    title: "Subí fotos",
    text: "Sacale un par de fotos al producto. La IA genera imágenes listas para vender sin inventar nada.",
  },
  {
    icon: Sparkles,
    title: "Publicá en segundos",
    text: "Título, descripción, estado y rango de precios de mercado, todo generado automáticamente.",
  },
  {
    icon: QrCode,
    title: "Compartí",
    text: "Link o QR para tu tienda. Pegalo en tu estado, en un cartel o en el grupo del barrio.",
  },
  {
    icon: MessageCircle,
    title: "Vendé mientras dormís",
    text: "Un vendedor con IA responde dudas, negocia el precio y te pasa el comprador por WhatsApp.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight">tulocal</span>
        <nav className="flex gap-2">
          <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
            Ingresar
          </Button>
          <Button nativeButton={false} render={<Link href="/signup" />}>
            Crear mi tienda
          </Button>
        </nav>
      </header>

      <section className="flex flex-1 flex-col justify-center gap-6 py-20">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Tu tienda lista en un minuto, con un vendedor que negocia por vos.
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Subí fotos, la IA arma la publicación y vos compartís el link. Los compradores chatean,
          acuerdan un precio y siguen por WhatsApp.
        </p>
        <div className="flex gap-2">
          <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
            Empezar gratis
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/login" />}>
            Ya tengo cuenta
          </Button>
        </div>
      </section>

      <section className="grid gap-6 border-t py-10 sm:grid-cols-2">
        {steps.map((step) => (
          <div key={step.title} className="flex gap-3">
            <step.icon className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="text-sm font-medium">{step.title}</h2>
              <p className="text-sm text-muted-foreground">{step.text}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
