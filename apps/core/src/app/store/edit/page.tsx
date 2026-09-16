import { redirect } from "next/navigation";

import { Screen } from "@/components/screen";
import { StoreEditForm } from "@/features/store/edit/form";
import { findStoreByOwner } from "@/features/store/find";
import { StoreLink } from "@/features/store/link";
import { requireCurrentSession } from "@/lib/session";

export default async function StoreEditPage() {
  const session = await requireCurrentSession();
  const store = await findStoreByOwner(session.user.id);

  if (store === null) {
    redirect("/new");
  }

  return (
    <Screen aside={<StoreLink handle={store.handle} />}>
      <h1 className="text-3xl">Tu tienda</h1>
      <StoreEditForm store={store} />
    </Screen>
  );
}
