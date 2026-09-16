import { redirect } from "next/navigation";

import { ensureStore } from "@/features/store/ensure";
import { requireCurrentSession } from "@/lib/session";

export default async function StorePage() {
  const session = await requireCurrentSession();
  const store = await ensureStore(session.user);

  redirect(`/${store.handle}`);
}
