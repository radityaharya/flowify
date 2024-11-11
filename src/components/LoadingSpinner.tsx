"use client";

import { useEffect, useState } from "react";

import { cn } from "~/lib/utils";

const loadingMessages = [
  "Tuning the instruments...",
  "Setting up the stage...",
  "Warming up the band...",
  "Mixing the sound...",
  "Rolling the drum...",
  "Strumming the guitar...",
  "Hitting the high notes...",
  "Feeling the bass...",
  "Cueing the lights...",
  "Getting ready to rock...",
  "Gathering beats",
  "Mixing it up...",
  "Blending the vibes...",
  "Building the ultimate playlist...",
  "Getting the party started...",
  "Fine-tuning the flow...",
  "Crafting your new jam...",
  "Connecting the dots...",
  "Creating something fresh...",
  "Making music magic...",
  "Getting ready to rock...",
  "Spinning the tunes...",
];

export interface ExtendedSVGProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const LoadingSpinner = ({
  size = 24,
  className,
  ...props
}: ExtendedSVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

export const LoadingWithText = ({
  size = 24,
  className,
  ...props
}: ExtendedSVGProps) => {
  const randomIndex = Math.floor(Math.random() * loadingMessages.length);
  const [loadingText, setLoadingText] = useState(loadingMessages[randomIndex]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newRandomIndex = Math.floor(Math.random() * loadingMessages.length);
      setLoadingText(loadingMessages[newRandomIndex]);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <LoadingSpinner size={size} className={className} {...props} />
      <span className="text-sm" suppressHydrationWarning>
        {loadingText}
      </span>
    </div>
  );
};
