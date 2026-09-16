import "@/styles/globals.css";

import type { Metadata } from "next";

import { fontBody, fontDisplay } from "@/styles/fonts";

export const metadata: Metadata = {
  title: "tulocal",
  description: "Armá tu tienda con una foto. La IA escribe la publicación y negocia por vos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${fontDisplay.variable} ${fontBody.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
