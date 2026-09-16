import { Lock } from "lucide-react";

import { QRCode } from "@/components/qr-code";

const STORE_URL = "https://tulocal.com/martina";
const QR_SIZE_IN_PIXELS = 132;

export function StorePrototype() {
  return (
    <div className="flex w-full max-w-56 flex-col items-center gap-4">
      <QRCode value={STORE_URL} size={QR_SIZE_IN_PIXELS} bgColor="transparent" />
      <div className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs">
        <Lock className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="truncate">
          <span className="text-muted-foreground">tulocal.com</span>/martina
        </span>
      </div>
    </div>
  );
}
