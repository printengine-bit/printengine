import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-store";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.printengine.in"),
  title: {
    default: "printengine — custom print & embroidery clothing",
    template: "%s | printengine",
  },
  description:
    "Design your own print with AI or upload your own artwork. Premium custom print and embroidery on t-shirts, hoodies, jerseys and doctor aprons. Shipped in 48 hours.",
  icons: {
    icon: [{ url: "/brand/favicon.png", type: "image/png", sizes: "1254x1254" }],
    shortcut: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
  openGraph: {
    title: "printengine — custom print & embroidery clothing",
    description:
      "Describe it. Wear it. Premium custom print and embroidery, made to order in India.",
    url: "https://www.printengine.in",
    siteName: "printengine",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
