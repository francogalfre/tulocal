import "@/styles/globals.css";

import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";

import { MotionProvider } from "@/components/motion/provider";
import { appOrigin } from "@/lib/origin";
import { fontBody, fontDisplay } from "@/styles/fonts";

const SITE_DESCRIPTION =
  "Armá tu tienda con una foto. La IA escribe la publicación y negocia por vos.";

export const metadata: Metadata = {
  metadataBase: new URL(appOrigin),
  title: { default: "tulocal", template: "%s | tulocal" },
  description: SITE_DESCRIPTION,
  applicationName: "tulocal",
  icons: {
    icon: [
      { url: "/favicon-dark.ico", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-light.ico", media: "(prefers-color-scheme: dark)" },
    ],
  },
  openGraph: { siteName: "tulocal", locale: "es_AR", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${fontDisplay.variable} ${fontBody.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
