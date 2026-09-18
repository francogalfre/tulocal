import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { InView } from "@/components/motion/inview";
import { Rise } from "@/components/motion/rise";
import { AdminStoreCard } from "@/features/admin/card";
import { AdminMetric } from "@/features/admin/metric";
import { summarizeAdminOverview } from "@/features/admin/overview";
import { findAdminStores } from "@/features/admin/stores";
import { formatArs } from "@/lib/money";

const numberFormatter = new Intl.NumberFormat("es-AR");

export default async function AdminPage() {
  const [overview, stores] = await Promise.all([summarizeAdminOverview(), findAdminStores()]);

  return (
    <div className="flex flex-col gap-12">
      <InView className="flex flex-col gap-6">
        <h1 className="text-3xl">Superadmin</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <AdminMetric label="Tiendas" value={numberFormatter.format(overview.totalStores)} />
          <AdminMetric label="Productos" value={numberFormatter.format(overview.totalProducts)} />
          <AdminMetric
            label="Suscripciones activas"
            value={numberFormatter.format(overview.activeSubscriptions)}
          />
          <AdminMetric
            label="Ingreso mensual"
            value={formatArs(overview.monthlyRecurringRevenueInArs)}
          />
        </div>
      </InView>

      <section className="flex flex-col gap-6">
        <InView className="flex flex-col gap-1">
          <h2 className="text-xl">Tiendas</h2>
          <p className="text-muted-foreground">
            {stores.length} {stores.length === 1 ? "tienda creada" : "tiendas creadas"}.
          </p>
        </InView>
        {stores.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Todavía no hay tiendas</EmptyTitle>
              <EmptyDescription>Cuando alguien arme su local, aparece acá.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <InView stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <Rise key={store.id} className="h-full">
                <AdminStoreCard store={store} />
              </Rise>
            ))}
          </InView>
        )}
      </section>
    </div>
  );
}
