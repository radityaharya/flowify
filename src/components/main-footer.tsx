"use client";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import useStore from "@/app/states/store";
import { Github } from "lucide-react";
import { Session } from "next-auth";

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

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="w-full">
      <div
        className={cn(
          "z-[20] flex w-full flex-col border-t bg-accent/10 items-start justify-between px-4 md:px-10 py-6 backdrop-blur-md",
          /\/workflow(?!s)/.test(pathname) ? "hidden" : "",
          /\/auth/.test(pathname) ? "hidden" : "",
        )}
      >
        <div className="flex flex-col gap-6 w-full mb-4">
          <Link href="/">
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
        </div>
        <div className="border-t md:flex justify-between items-center text-sm w-full">
          <div className="flex flex-col md:flex-row my-6 gap-4 underline underline-offset-4 text-muted-foreground">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
          </div>
          <p className="text-muted-foreground">
            <Link
              href="https://github.com/radityaharya/flowify"
              target="_blank"
              className="flex flex-row gap-2 items"
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
