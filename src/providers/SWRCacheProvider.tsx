"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import { SWRConfig } from "swr";
export default function SWRCacheProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
  );
}
