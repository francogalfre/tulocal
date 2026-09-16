import { redirect } from "next/navigation";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Logo } from "@/components/logo";
import { InView } from "@/components/motion/inview";
import { Asked } from "@/features/metrics/asked";
import { Chart } from "@/features/metrics/chart";
import { Headline } from "@/features/metrics/headline";
import { Ranking } from "@/features/metrics/ranking";
import { Stat } from "@/features/metrics/stat";
import { summarizeStoreMetrics } from "@/features/metrics/summary";
import { findStoreByOwner } from "@/features/store/find";
import { StoreLink } from "@/features/store/link";
import { requireCurrentSession } from "@/lib/session";

export default async function MetricsPage() {
  const session = await requireCurrentSession();
  const store = await findStoreByOwner(session.user.id);

  if (store === null) {
    redirect("/");
  }

  const metrics = await summarizeStoreMetrics(store.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-5 pt-6 pb-16">
      <header className="flex h-9 items-center justify-between">
        <Logo />
        <StoreLink handle={store.handle} />
      </header>
      <InView className="flex flex-col gap-1.5">
        <h1 className="text-3xl">Cómo va tu tienda</h1>
        <p className="text-muted-foreground">
          Todo lo que pasó en tulocal/{store.handle} desde que la abriste.
        </p>
      </InView>
      <InView as="section" className="flex flex-col gap-6 rounded-2xl bg-secondary px-6 py-7">
        <Headline label="Visitas de los últimos 30 días" total={metrics.recentVisits} />
        <Chart series={metrics.dailyVisits} />
      </InView>
      <InView as="section" className="flex flex-col gap-4">
        <h2 className="text-xl">De la visita a la venta</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Visitas a tu tienda" total={metrics.storeVisits} />
          <Stat label="Visitas a productos" total={metrics.productVisits} />
          <Stat label={`Charlas con ${store.agentName}`} total={metrics.chats} />
          <Stat label="Compradores en serio" total={metrics.seriousBuyers} />
        </div>
      </InView>
      <InView as="section" className="flex flex-col gap-4">
        <h2 className="text-xl">Tu catálogo</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Productos publicados" total={metrics.publishedProducts} />
          <Stat label="Productos vendidos" total={metrics.soldProducts} />
          <Stat label="Consultas por WhatsApp" total={metrics.whatsappClicks} />
          <Stat label="Preguntas sin responder" total={metrics.pendingQuestions} />
        </div>
      </InView>
      <InView as="section" className="flex flex-col gap-4">
        <h2 className="text-xl">Lo más visto</h2>
        {metrics.topProducts.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Todavía no hay nada para medir</EmptyTitle>
              <EmptyDescription>
                Publicá tu primer producto y compartí el link de tu tienda.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Ranking products={metrics.topProducts} />
        )}
      </InView>
      <InView as="section" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl">Lo que preguntan los compradores</h2>
          <p className="text-sm text-muted-foreground">
            Lo que {store.agentName} no supo responder y te consultó. Sumalo a la descripción o
            respondelo y no te lo vuelven a preguntar.
          </p>
        </div>
        {metrics.mostAskedProducts.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Todavía nadie preguntó nada</EmptyTitle>
              <EmptyDescription>
                Cuando {store.agentName} no sepa algo de un producto, la pregunta aparece acá.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Asked products={metrics.mostAskedProducts} />
        )}
      </InView>
    </main>
  );
}
