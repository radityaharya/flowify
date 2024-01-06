/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React from 'react';
import { CardWithHeader } from '~/components/nodes/Primitives/Card';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const Page = () => {
  return (
    <div className="flex flex-col gap-4 dark p-4">
      <h1> Card </h1>
      <CardWithHeader title="Playlist" type="Source" status="success" info="Get a list of the songs in a playlist.">
        <Label>Name</Label>
        <Input placeholder="Project name" />
        <Label>Region</Label>
        <Select>
          <SelectTrigger>
            <SelectValue>United States</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="eu">Europe</SelectItem>
            <SelectItem value="as">Asia</SelectItem>
          </SelectContent>
        </Select>
      </CardWithHeader>
    </div>
  );
};

export default Page;
