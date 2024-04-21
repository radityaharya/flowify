"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "~/components/ui/button";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <div className="flex items-center py-1 text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Flowify
        </div>
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link
          href="/flow"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/flow" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Builder
        </Link>
        <Link
          href="/workflows"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/workflows")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Workflows
        </Link>
        <Link
          href="/examples"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/examples")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Examples
        </Link>
        <Link
          href="https://github.com/radityaharya/flowify"
          className={cn(
            "hidden text-foreground/60 transition-colors hover:text-foreground/80 lg:block",
          )}
        >
          GitHub
        </Link>
      </nav>
    </div>
  );
}

export function SiteNav({ className }: { className?: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  return (
    <div
      className={cn(
        "sticky top-0 z-[3] flex w-full items-center justify-between bg-transparent px-6 py-4 backdrop-blur-md",
        className,
        pathname === "/flow" ? "absolute border-b bg-background backdrop-blur-none" : "",
        pathname === "/" ? "absolute" : "",
        pathname.startsWith("/auth/login")
          ? "bg-transparent backdrop-blur-none"
          : "",
      )}
    >
      <MainNav />
      {session ? (
        <div className="flex flex-row items-center gap-4">
          <span className="text-sm font-medium text-foreground">
            {`${session.user.name}`}
          </span>
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session?.user?.image ?? ""}
              alt={session?.user?.name ?? ""}
            />
            <AvatarFallback className="text-sm font-medium">
              {session?.user?.name?.split(" ").map((n) => n[0])}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : (
        <div>
          <Link
            href="/auth/login"
            className={cn(
              "border",
              buttonVariants({ variant: "ghost" }),
              pathname.startsWith("/auth/login") ?? "hidden",
            )}
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
}
