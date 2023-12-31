import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navigation from "@/components/Navigation";
import TanstackProvider from "@/providers/TanstackProvider";
import { WalletProvider } from "@/providers/WalletProvider";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crypto Wallet",
  description: "Track your cryptocurrency investments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TanstackProvider>
            <WalletProvider>
              <ThemeProvider attribute="class" defaultTheme="system">
                <Navigation />
                {children}
              </ThemeProvider>
            </WalletProvider>
          </TanstackProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
