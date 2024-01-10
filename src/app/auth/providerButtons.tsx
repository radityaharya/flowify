"use client";

import { getProviders, signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { redirect } from "next/navigation";

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
  const {
    screen,
    innerWidth,
    innerHeight,
    screenLeft,
    screenTop,
    screenX,
    screenY,
    open,
  } = window;
  const dualScreenLeft = screenLeft ?? screenX;
  const dualScreenTop = screenTop ?? screenY;

  const width =
    innerWidth || document.documentElement.clientWidth || screen.width;
  const height =
    innerHeight || document.documentElement.clientHeight || screen.height;

  const systemZoom = width / screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft;
  const top = (height - h) / 2 / systemZoom + dualScreenTop;
  const newWindow = open(
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

const LoadingSVG = () => (
  <svg
    aria-hidden="true"
    className="inline h-4 w-4 animate-spin fill-gray-600 text-gray-200 dark:fill-gray-300 dark:text-gray-600"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="currentColor"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentFill"
    />
  </svg>
);

// million-ignore
export default function ProviderButtons() {
  const [providers, setProviders] = useState<Record<string, Provider>>({});


  const isMobile = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  }

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      redirect("/");
    }
  }, [session]);

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
            {
              status === "loading" ? (
                <span>
                  <LoadingSVG />
                  Authenticating...
                </span>
              ) : (
                <span>Sign in with {provider.name}</span>
              )
            }
          </Button>
        </div>
      ))}
    </div>
  );
}
