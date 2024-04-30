"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { LoadingSpinner } from "~/components/LoadingSpinner";

const SignInPage = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    switch (status) {
      case "loading":
        if (!session) void signIn("spotify");
        break;
      case "authenticated":
        if (session) void window.close();
        break;
      default:
        break;
    }
  }, [session, status]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return "Loading...";
      case "authenticated":
        return "Redirecting...";
      case "unauthenticated":
        return "Redirecting...";
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#121212]">
      <div className="flex flex-col items-center">
        <div role="status">
          <LoadingSpinner className="h-8 w-8" />
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-4 text-lg text-white">{renderContent()}</p>
      </div>
    </div>
  );
};

export default SignInPage;
