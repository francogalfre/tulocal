import type { Metadata } from "next";

import { Rise } from "@/components/motion/rise";
import { Stagger } from "@/components/motion/stagger";
import { Screen } from "@/components/screen";
import { Dropzone } from "@/features/product/upload/dropzone";
import { StoreBanner } from "@/features/store/banner";
import { ensureStore } from "@/features/store/ensure";
import { StoreLink } from "@/features/store/link";
import { requireCurrentSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Subí un producto",
  robots: { index: false },
};

export default async function NewProductPage() {
  const session = await requireCurrentSession();
  const store = await ensureStore(session.user);

  return (
    <Screen aside={<StoreLink handle={store.handle} />}>
      <Stagger className="flex flex-col gap-10">
        <Rise>
          <StoreBanner store={store} />
        </Rise>
        <Rise>
          <Dropzone />
        </Rise>
      </Stagger>
    </Screen>
  );
}
