import { QRCode } from "@/components/qr-code";

type QrProps = {
  url: string;
  handle: string;
};

const QR_SIZE_IN_PIXELS = 208;

export function Qr({ url, handle }: QrProps) {
  return (
    <figure className="flex flex-col items-center gap-4 rounded-2xl bg-secondary px-6 py-8">
      <QRCode
        value={url}
        size={QR_SIZE_IN_PIXELS}
        bgColor="var(--secondary)"
        className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500"
      />
      <figcaption className="font-heading text-lg font-semibold">tulocal/{handle}</figcaption>
    </figure>
  );
}
