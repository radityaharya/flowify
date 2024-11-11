"use client";

import { SquareArrowOutUpRight } from "lucide-react";
import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";

import useStore from "@/app/states/store";
import { SystemInfo } from "@/components/SystemInfo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "~/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface NavLinkProps extends LinkProps {
  href: string;
  activePath?: string | RegExp;
  children: React.ReactNode;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({
  href,
  activePath,
  children,
  className,
  ...props
}) => {
  const path = usePathname();
  const isActive = useMemo(
    () =>
      activePath instanceof RegExp
        ? activePath.test(path)
        : path.startsWith(activePath || ""),
    [path, activePath],
  );

  return (
    <Link
      href={href}
      {...props}
      className={cn(
        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isActive ? "text-foreground" : "text-foreground/60",
        className,
      )}
    >
      {children}
    </Link>
  );
};

export function MainNav() {
  const resetReactFlow = useStore((state) => state.resetReactFlow);

  const handleResetReactFlow = useCallback(() => {
    resetReactFlow();
  }, [resetReactFlow]);

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
            className="mr-2 size-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Flowify
        </div>
      </Link>
      <nav className="hidden items-center gap-2 text-sm sm:flex">
        <NavLink
          href="/workflow"
          onClick={handleResetReactFlow}
          activePath={/\/workflow(?!s)/}
        >
          Builder
        </NavLink>
        <NavLink href="/workflows" activePath="/workflows">
          Workflows
        </NavLink>
        <NavLink href="/examples" activePath="/examples">
          Examples
        </NavLink>
        <NavLink
          href="https://github.com/radityaharya/flowify"
          className={cn(
            "hidden text-foreground/60 transition-colors hover:text-foreground/80 lg:block",
          )}
        >
          GitHub
        </NavLink>
      </nav>
    </div>
  );
}

interface SiteNavProps {
  className?: string;
  session: Session | null;
}

export function SiteNav({ className }: SiteNavProps) {
  const { data: sessionData } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    signOut();
    router.push("/auth/login");
  }, [router]);

  const navClass = useMemo(() => {
    let classes =
      "select-none sticky top-0 z-[20] flex w-full items-center justify-between bg-transparent px-6 py-4 backdrop-blur-md";
    if (/\/workflow(?!s)/.test(pathname))
      classes += " absolute border-b bg-background backdrop-blur-none";
    if (pathname === "/") classes += " absolute";
    if (pathname.startsWith("/auth"))
      classes += " absolute bg-transparent backdrop-blur-none";
    if (pathname.startsWith("/auth/p")) classes += " hidden";
    if (pathname.startsWith("/workflows")) classes += " border-b bg-accent/10";
    return classes;
  }, [pathname]);

  return (
    <div className={cn(navClass, className)}>
      <MainNav />
      <div className="flex flex-row items-center gap-6">
        <div className="hidden sm:block">
          <SystemInfo />
        </div>
        {sessionData?.user ? (
          <div className="flex flex-row items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="size-8 overflow-hidden rounded-full"
                >
                  <Avatar className="size-8">
                    <AvatarImage
                      src={sessionData?.user?.image ?? ""}
                      alt={sessionData?.user?.name ?? ""}
                    />
                    <AvatarFallback className="text-sm font-medium">
                      {sessionData?.user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex flex-col">
                  <p className="text-sm font-medium text-foreground">
                    {`${sessionData.user.name}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {`${sessionData.user.email}`}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="https://www.spotify.com/account/overview/"
                    target="_blank"
                    className="flex flex-row items-center gap-2"
                  >
                    <span>Spotify Account</span>
                    <SquareArrowOutUpRight className="size-3" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex h-8 items-center">
            <Link
              href="/auth/login"
              className={cn(
                "border",
                buttonVariants({ variant: "ghost" }),
                pathname.startsWith("/auth/login") ? "hidden" : "",
              )}
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
