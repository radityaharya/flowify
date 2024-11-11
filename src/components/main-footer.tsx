"use client";
import { Github } from "lucide-react";
import type { LinkProps } from "next/link";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

import useStore from "@/app/states/store";
import { cn } from "@/lib/utils";

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

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="w-full">
      <div
        className={cn(
          "z-20 flex w-full flex-col items-start justify-between border-t bg-accent/10 px-4 py-6 backdrop-blur-md md:px-10",
          pathname.includes("/workflow") && !pathname.includes("/workflows")
            ? "hidden"
            : "",
          pathname.includes("/auth") ? "hidden" : "",
        )}
      >
        <div className="mb-4 flex w-full flex-col gap-6">
          <Link href="/">
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
        </div>
        <div className="w-full items-center justify-between border-t text-sm md:flex">
          <div className="my-6 flex flex-col gap-4 text-muted-foreground underline underline-offset-4 md:flex-row">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
          </div>
          <p className="text-muted-foreground">
            <Link
              href="https://github.com/radityaharya/flowify"
              target="_blank"
              className="items flex flex-row gap-2"
            >
              <Github className="size-4" />
              radityaharya/flowify
            </Link>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Spotify is a registered trademark of Spotify AB. This project is not
          affiliated with or endorsed by Spotify AB
        </p>
      </div>
    </footer>
  );
}
