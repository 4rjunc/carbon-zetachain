import type { Metadata } from "next";
import { Inter as interFonts } from "next/font/google";
import "./globals.css";
import { cookieToInitialState } from "wagmi";
import { headers } from "next/headers";
import { config } from "./config";
import ContextProvider from "./context";

const inter = interFonts({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "carbon",
  description: "share, buy and sell your scientific papers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));

  return (
    <html lang="en">
      <body className={inter.className}>
        <ContextProvider initialState={initialState}>
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
