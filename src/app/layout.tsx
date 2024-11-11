import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import Footer from "~/components/main-footer";
import { SiteNav } from "~/components/main-nav";
import NextAuthProvider from "~/providers/NextAuthProvider";
import SWRCacheProvider from "~/providers/SWRCacheProvider";
import { auth } from "~/server/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Flowify",
  description:
    "Flowify is a Spotify playlist generator with a drag-and-drop interface.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} dark`}>
        <NextAuthProvider>
          <SWRCacheProvider>
            <SiteNav session={session} />
            {children}
            <Toaster expand={true} richColors />
            <Footer />
          </SWRCacheProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
