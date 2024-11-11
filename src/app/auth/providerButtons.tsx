"use client";

import { redirect } from "next/navigation";
import { getProviders, signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Button } from "~/components/ui/button";

type Provider = {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
};

const popupCenter = ({
  url,
  title,
  w,
  h,
}: {
  url: string;
  title: string;
  w: number;
  h: number;
}) => {
  // Get window properties safely
  const win = typeof window !== "undefined" ? window : null;
  if (!win) return null;

  // Get screen dimensions
  const screenWidth = win.screen.width;
  const screenHeight = win.screen.height;
  const screenAvailWidth = win.screen.availWidth;

  // Get window dimensions
  const windowWidth =
    win.innerWidth || document.documentElement.clientWidth || screenWidth;
  const windowHeight =
    win.innerHeight || document.documentElement.clientHeight || screenHeight;

  // Get screen position
  const dualScreenLeft = win.screenLeft ?? win.screenX;
  const dualScreenTop = win.screenTop ?? win.screenY;

  const systemZoom = windowWidth / screenAvailWidth;
  const left = (windowWidth - w) / 2 / systemZoom + dualScreenLeft;
  const top = (windowHeight - h) / 2 / systemZoom + dualScreenTop;

  const newWindow = win.open(
    url,
    title,
    `scrollbars=yes, width=${w / systemZoom}, height=${
      h / systemZoom
    }, top=${top}, left=${left}, resizable=yes, toolbar=no, menubar=no, location=no, directories=no, status=no, titlebar=no`,
  );

  if (newWindow) {
    newWindow.document.cookie = "SameSite=None; Secure";
  }

  return newWindow;
};

// million-ignore
export default function ProviderButtons() {
  const [providers, setProviders] = useState<Record<string, Provider>>({});

  const isMobile = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  };

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      redirect("/workflows");
    }
  }, [status]);

  useEffect(() => {
    async function getprov() {
      const providers = await getProviders();
      if (providers) {
        setProviders(providers);
      } else {
        console.error("Failed to fetch providers");
      }
    }
    getprov().catch(console.error);
  }, []);

  return (
    <div className="flex w-full flex-col justify-center gap-2">
      {Object.values(providers).map((provider) => (
        <div key={provider.name} className="flex flex-row justify-center">
          <Button
            onClick={async () => {
              if (!isMobile()) {
                popupCenter({
                  url: "/auth/p/spotify",
                  title: `Sign in with ${provider.name}`,
                  w: 600,
                  h: 700,
                });
              } else {
                await signIn(provider.id);
              }
            }}
            className="flex flex-row items-center justify-between gap-2"
          >
            {provider.name === "Spotify" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 2931 2931"
                width="24"
                height="24"
              >
                <path
                  className="fill-background"
                  d="M1465.5 0C656.1 0 0 656.1 0 1465.5S656.1 2931 1465.5 2931 2931 2274.9 2931 1465.5C2931 656.2 2274.9.1 1465.5 0zm672.1 2113.6c-26.3 43.2-82.6 56.7-125.6 30.4-344.1-210.3-777.3-257.8-1287.4-141.3-49.2 11.3-98.2-19.5-109.4-68.7-11.3-49.2 19.4-98.2 68.7-109.4C1242.1 1697.1 1721 1752 2107.3 1988c43 26.5 56.7 82.6 30.3 125.6zm179.3-398.9c-33.1 53.8-103.5 70.6-157.2 37.6-393.8-242.1-994.4-312.2-1460.3-170.8-60.4 18.3-124.2-15.8-142.6-76.1-18.2-60.4 15.9-124.1 76.2-142.5 532.2-161.5 1193.9-83.3 1646.2 194.7 53.8 33.1 70.8 103.4 37.7 157.1zm15.4-415.6c-472.4-280.5-1251.6-306.3-1702.6-169.5-72.4 22-149-18.9-170.9-91.3-21.9-72.4 18.9-149 91.4-171 517.7-157.1 1378.2-126.8 1922 196 65.1 38.7 86.5 122.8 47.9 187.8-38.5 65.2-122.8 86.7-187.8 48z"
                />
              </svg>
            )}
            {status === "loading" ? (
              <span>
                <LoadingSpinner className="size-2" />
                Authenticating...
              </span>
            ) : (
              <span>Sign in with {provider.name}</span>
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
