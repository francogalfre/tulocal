export type WhatsappLink = {
  phone: string;
  message: string;
};

export function buildWhatsappUrl(link: WhatsappLink): string {
  const digits = link.phone.replace("+", "");

  return `https://wa.me/${digits}?text=${encodeURIComponent(link.message)}`;
}
