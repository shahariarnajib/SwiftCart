import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { StoreLayoutWrapper } from "@/components/StoreLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Swift Cart - Bangladesh",
    default: "Swift Cart - Shop Smarter. Shop Faster. Premium Online Shopping in Bangladesh",
  },
  description:
    "Swift Cart is Bangladesh's premier online store offering genuine gadgets, electronics, lifestyle accessories, and home goods with super-fast express delivery and Cash on Delivery.",
  keywords: [
    "Swift Cart",
    "online shopping bangladesh",
    "gadgets bd",
    "electronics dhaka",
    "cash on delivery",
    "ecommerce bangladesh",
  ],
  authors: [{ name: "Swift Cart" }],
  openGraph: {
    title: "Swift Cart - Shop Smarter. Shop Faster.",
    description: "Premium online shopping destination in Bangladesh. Authentic products, cash on delivery, and speedy doorstep delivery.",
    siteName: "Swift Cart",
    locale: "en_BD",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-white text-slate-900 flex flex-col`}>
        <CartProvider>
          <StoreLayoutWrapper>{children}</StoreLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
