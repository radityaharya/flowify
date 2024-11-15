import Link from "next/link";
import { notFound } from "next/navigation";

import GradientBackground from "~/components/animatedBackground/GradientsBackground";

import ProviderButtons from "../providerButtons";

type Params = Promise<{ route: "login" | "signup" }>;
type SearchParams = Promise<any>;

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  if (["login", "signup"].includes(resolvedParams.route) === false) {
    return notFound();
  }

  const isLogin = resolvedParams.route === "login";
  const error = resolvedSearchParams.error;

  return (
    <div className="h-svh">
      <div className="container relative grid h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* <Link
          href={`/auth/${isLogin ? "signup" : "login"}`}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8",
          )}
        >
          {isLogin ? "Sign up" : "Login"}
        </Link> */}
        <div className="relative hidden h-full flex-col p-10 dark:border-r lg:flex">
          <GradientBackground />
          {/* <div className="relative z-20 flex items-center text-lg font-medium">
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
          </div> */}
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg"></p>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {isLogin ? "Welcome back" : "Let's get started"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Login with your Spotify account"
                  : "Create a new account"}
              </p>
            </div>
            <ProviderButtons />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By {isLogin ? "logging in" : "signing up"} you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
            {error && (
              <div className="rounded-md bg-red-400 p-2 text-center text-sm text-muted-foreground">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
