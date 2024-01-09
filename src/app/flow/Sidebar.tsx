/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "src/components/ui/input";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area"
import useStore from "../states/store";
import { useShallow } from "zustand/react/shallow";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DragableNode } from "@/components/DragableNode";

export default function Sidebar() {
  const { session } = useStore(
    useShallow((state) => ({
      session: state.session,
      setSessionStore: state.setSession,
    })),
  );

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  const onDrop = (event) => {
    return;
  }

  return(
    <aside className="col-span-1 flex max-h-screen flex-col border-r" onDragOver={onDragOver} onDrop={onDrop}>
    <div className="flex-none px-4 pt-4">
      <div className="flex flex-col justify-between gap-6">
        <div className="flex flex-row justify-between">
          <div className="relative z-20 flex items-center text-lg font-medium">
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
          <div className="flex flex-row items-center gap-4">
            <span className="text-foreground">
              {session ? `${session.user.name}` : "Login"}
            </span>
            <Avatar>
              <AvatarImage src={session?.user?.image ?? ""} />
              <AvatarFallback>
                {session?.user?.name?.split(" ").map((n) => n[0])}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <Input
          className="mb-4 w-full"
          id="search"
          placeholder="Search..."
        />
      </div>
    </div>
    <Accordion type="single" collapsible className="p-4">
      <AccordionItem value="item-1">
        <AccordionTrigger>Sources</AccordionTrigger>
        <AccordionContent>
          <ScrollArea>
          <DragableNode
            nodeType="Source.playlist"
            title="Source"
            description="Playlist source"
            type="Source"
          />
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Combiners</AccordionTrigger>
        <AccordionContent>
          <ScrollArea>
          <DragableNode
            nodeType="Combiner.alternate"
            title="Alternate"
            description="Alternate between playlists"
            type="Combiner"
          />
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Filters</AccordionTrigger>
        <AccordionContent>
          <DragableNode
            nodeType="Filter.dedupeTracks"
            title="Dedupe Tracks"
            description="Remove duplicate tracks"
            type="Filter"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </aside>
  )
}