import { toDataURL } from "qrcode";

type QrProps = {
  url: string;
};

const QR_SIZE_IN_PIXELS = 192;

export async function Qr({ url }: QrProps) {
  const dataUrl = await toDataURL(url, {
    width: QR_SIZE_IN_PIXELS,
    margin: 1,
    color: { dark: "#14231a", light: "#f6f4ec" },
  });

  return (
    <img
      src={dataUrl}
      alt={`QR de ${url}`}
      width={QR_SIZE_IN_PIXELS}
      height={QR_SIZE_IN_PIXELS}
      className="rounded-lg"
    />
  );
}
