"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "~/lib/utils";

import { DotIcon, InfoIcon } from "lucide-react";
import { Suspense } from "react";
import { Separator } from "~/components/ui/separator";
interface CardWithHeaderProps {
  children: React.ReactNode;
  title: string;
  type: string;
  status?: string;
  info?: string;
  className?: string;
}

export function CardWithHeader({
  children,
  title,
  type,
  status,
  info,
  className,
}: CardWithHeaderProps) {
  return (
    <Card className={cn("w-[350px] border dark:border-gray-600 flex flex-col gap-2", className)}>
      <div className="flex w-full flex-row gap-2 rounded-lg p-2 bg-accent">
        <DotIcon
          size={24}
          className={cn("text-gray-500", {
            "text-red-400": status === "error",
            "text-green-400": status === "success",
            "text-gray-500": status === "loading",
          })}
        />
        <span className="text-sm font-medium">{type} :</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      {info && (
        <div className="flex flex-col gap-6 p-6 py-3">
          <div className="flex flex-row gap-2">
            <InfoIcon size={16} className="mt-[4px] min-w-4" />
            <p className="text-sm font-medium opacity-80">
            {info}
            </p>
          </div>
          <Separator />
        </div>
      )}
      <CardContent className={`${info ? "pt-0" : "pt-6"}`}>
        {children}
      </CardContent>
    </Card>
  );
}
