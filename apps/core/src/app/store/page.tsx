import { redirect } from "next/navigation";

import { ensureStore } from "@/features/store/ensure";
import { findStoreEntry } from "@/features/store/find";
import { requireCurrentSession } from "@/lib/session";

export default async function StorePage() {
  const session = await requireCurrentSession();
  const store = await ensureStore(session.user);
  const entry = await findStoreEntry(session.user.id);

  if (entry === null || !entry.hasProducts) {
    redirect("/new");
  }

  redirect(`/${store.handle}`);
}
