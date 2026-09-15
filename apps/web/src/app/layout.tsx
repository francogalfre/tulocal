import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: { default: "tutienda", template: "%s · tutienda" },
  description: "tu tienda, desde una foto.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
