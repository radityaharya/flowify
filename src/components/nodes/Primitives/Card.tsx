"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { cn } from "~/lib/utils";

import { DotIcon, InfoIcon } from "lucide-react";
import { Separator } from "~/components/ui/separator";

interface CardWithHeaderProps {
  children: React.ReactNode;
  id: string;
  title: string;
  type: string;
  status?: string;
  info?: string;
  className?: string;
}

export function CardWithHeader({
  children,
  id,
  title,
  type,
  status,
  info,
  className,
}: CardWithHeaderProps) {
  return (
    <div className="bg-transparent flex flex-col">
      <div className="flex flex-row">
        <div className="flex flex-col gap-2"></div>
      </div>
      <Card
        className={cn(
          "flex w-[350px] flex-col gap-2 border dark:border-gray-600",
          className,
        )}
      >
        <div className="flex w-full flex-row gap-2 rounded-lg bg-accent p-2 justify-between">
          <div className="flex flex-row">
            <DotIcon
              size={24}
              className={cn("text-gray-500", {
                "text-red-400": status === "error",
                "text-green-400": status === "success",
                "text-gray-500": status === "loading",
              })}
            />
            <span className="font-medium text-sm">{title}</span>
          </div>
          <Badge>{type}</Badge>
        </div>
        {info && (
          <div className="flex flex-col gap-6 p-6 py-3">
            <div className="flex flex-row gap-2">
              <InfoIcon size={16} className="mt-[4px] min-w-4" />
              <p className="font-medium text-sm opacity-80">{info}</p>
            </div>
            <Separator />
          </div>
        )}
        <CardContent className={`${info ? "pt-0" : "pt-6"}`}>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
