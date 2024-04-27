"use client";

import { SystemInfo } from "@/components/SystemInfo";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "~/components/ui/button";

import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import useStore from "@/app/states/store";
import { useMemo } from "react";

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
      <nav className="flex items-center gap-2 text-sm">
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
}

export function SiteNav({ className }: SiteNavProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navClass = useMemo(() => {
    let classes =
      "sticky top-0 z-[3] flex w-full items-center justify-between bg-transparent px-6 py-4 backdrop-blur-md";
    if (/\/workflow(?!s)/.test(pathname))
      classes += " absolute border-b bg-background backdrop-blur-none";
    if (pathname === "/") classes += " absolute";
    if (pathname.startsWith("/auth"))
      classes += " absolute bg-transparent backdrop-blur-none";
    if (pathname.startsWith("/auth/p")) classes += " hidden";
    return classes;
  }, [pathname]);

  return (
    <div className={cn(navClass, className)}>
      <MainNav />
      <div className="flex flex-row gap-6 items-center">
        <SystemInfo />
        {session ? (
          <div className="flex flex-row items-center gap-4">
            <span className="font-medium text-foreground text-sm">
              {`${session.user.name}`}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session?.user?.image ?? ""}
                alt={session?.user?.name ?? ""}
              />
              <AvatarFallback className="font-medium text-sm">
                {/* biome-ignore lint/correctness/useJsxKeyInIterable: <explanation> */}
                {session?.user?.name?.split(" ").map((n) => n[0])}
              </AvatarFallback>
            </Avatar>
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
