import { toDataURL } from "qrcode";

type QrProps = {
  url: string;
  handle: string;
};

const QR_SIZE_IN_PIXELS = 208;

export async function Qr({ url, handle }: QrProps) {
  const dataUrl = await toDataURL(url, {
    width: QR_SIZE_IN_PIXELS,
    margin: 0,
    color: { dark: "#14231a", light: "#00000000" },
  });

  return (
    <figure className="flex flex-col items-center gap-4 rounded-2xl bg-secondary px-6 py-8">
      <img
        src={dataUrl}
        alt={`Código QR de ${url}`}
        width={QR_SIZE_IN_PIXELS}
        height={QR_SIZE_IN_PIXELS}
        className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500"
      />
      <figcaption className="font-heading text-lg font-semibold">tulocal/{handle}</figcaption>
    </figure>
  );
}
