import "~/styles/globals.css";

import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";
import { SiteNav } from "~/components/main-nav";
import NextAuthProvider from "~/providers/NextAuthProvider";
import SWRCacheProvider from "~/providers/SWRCacheProvider";
import { getServerSession } from 'next-auth';

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
  
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} dark`}>
        <NextAuthProvider>
          <SWRCacheProvider>
            <SiteNav session={session} />
            {children}
            <Toaster expand={true} richColors />
          </SWRCacheProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
