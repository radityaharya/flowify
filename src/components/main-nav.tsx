"use client";

import { SystemInfo } from "@/components/SystemInfo";
import Link, { LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, buttonVariants } from "~/components/ui/button";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import useStore from "@/app/states/store";
import { Session } from "next-auth";
import { useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "~/app/utils/fetcher";
import { signOut } from "next-auth/react";
import { SquareArrowOutUpRight } from "lucide-react";

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
  const isActive =
    activePath instanceof RegExp
      ? activePath.test(path)
      : path.startsWith(activePath || "");

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
  const { resetReactFlow } = useStore((state) => ({
    resetReactFlow: state.resetReactFlow,
  }));

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <div className="flex items-center py-1 font-medium text-lg">
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
      <nav className="hidden sm:flex items-center gap-2 text-sm">
        <NavLink
          href="/workflow"
          onClick={() => resetReactFlow()}
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
            "hidden text-foreground/60 transition-colors lg:block hover:text-foreground/80",
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

export function SiteNav({ className, session }: SiteNavProps) {
  // const { data: session } = useSession();
  const { data: sessionData } = useSWR("/api/auth/session", fetcher, {
    fallbackData: session || undefined,
  });
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

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
      <div className="flex flex-row gap-6 items-center">
        <div className="hidden sm:block">
          <SystemInfo />
        </div>
        {sessionData?.user ? (
          <div className="flex flex-row items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="overflow-hidden rounded-full h-8 w-8"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={sessionData?.user?.image ?? ""}
                      alt={sessionData?.user?.name ?? ""}
                    />
                    <AvatarFallback className="font-medium text-sm">
                      {/* biome-ignore lint/correctness/useJsxKeyInIterable: <explanation> */}
                      {sessionData?.user?.name?.split(" ").map((n) => n[0])}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex flex-col">
                  <p className="font-medium text-foreground text-sm">
                    {`${sessionData.user.name}`}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {`${sessionData.user.email}`}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="https://www.spotify.com/account/overview/"
                    target="_blank"
                    className="flex flex-row gap-2 items-center"
                  >
                    <span>Spotify Account</span>
                    <SquareArrowOutUpRight className="size-3"/>
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
          <div className="h-8 flex items-center">
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
    </div>
  );
}
