import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { appName } from "@/const";
import { Providers } from "@/provider";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: appName,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? process.env.VERCEL_URL ?? ""
  ),
  description: "Unaprijeđena verzija HJP-a",

  other: {
    "darkreader-lock": 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <Providers>
          <div className={`text-accents-9`}>
            <Header />
            <div
              className={`mx-auto flex h-full min-h-screen w-full max-w-5xl flex-col px-6 pb-10`}
            >
              {children}
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
