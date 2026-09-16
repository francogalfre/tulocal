import { Screen } from "@/components/screen";
import { Dropzone } from "@/features/product/upload/dropzone";
import { StoreBanner } from "@/features/store/banner";
import { ensureStore } from "@/features/store/ensure";
import { requireCurrentSession } from "@/lib/session";

export default async function NewProductPage() {
  const session = await requireCurrentSession();
  const store = await ensureStore(session.user);

  return (
    <Screen>
      <StoreBanner store={store} />
      <Dropzone />
    </Screen>
  );
}
