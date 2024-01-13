/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Input } from "src/components/ui/input";
import reactFlowToWorkflow from "../utils/reactFlowToWorkflow";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import useStore from "../states/store";
import { useShallow } from "zustand/react/shallow";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DragableNode } from "@/components/DragableNode";
import { Button } from "@/components/ui/button";
import { InfoIcon, PlayIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import React from "react";
function Sidebar() {
  const { session, nodes, edges, alert, setAlertStore } = useStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      session: state.session,
      setSessionStore: state.setSession,
      alert: state.alert,
      setAlertStore: state.setAlert,
    })),
  );

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event) => {
    return;
  };

  function handleRun() {
    const workflow = reactFlowToWorkflow({ nodes, edges });
    const blob = new Blob([JSON.stringify(workflow)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    // link.download = "workflow.json";
    // link.href = url;
    // link.click();
  }

  const [openAlert, setOpenAlert] = useState(false);

  useEffect(() => {
    if (alert) {
      setOpenAlert(true);
    }
  }, [alert]);

  function handleOpenChange() {
    setOpenAlert(false);
    setAlertStore(null);
  }

  return (
    <aside
      className="col-span-1 flex max-h-screen flex-col justify-between border-r"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex flex-col gap-6">
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
          </div>
        </div>
        <div className="flex flex-col gap-1 px-4">
          <h2 className="font-bold tracking-wider">
            Workflow Builder
          </h2>
          <p className="text-xs font-normal opacity-80 flex flex-row gap-1">
            Drag and drop nodes to the canvas to create a workflow
          </p>
        </div>
        <Accordion type="single" collapsible className="px-4" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Library</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
                <DragableNode
                  nodeType="Source.playlist"
                  title="Playlist"
                  description="Playlist source"
                  type="Source"
                />
                <DragableNode
                  nodeType="Library.likedTracks"
                  title="Liked Tracks"
                  description="Liked tracks"
                  type="Source"
                />
                <DragableNode
                nodeType="Library.saveAsNew"
                title="Save as new"
                description="Saves workflow output to a new playlist"
                type="Target"
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Combiners</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
                <DragableNode
                  nodeType="Combiner.alternate"
                  title="Alternate"
                  description="Alternate between playlists"
                  type="Combiner"
                />
                <DragableNode
                  nodeType="Combiner.push"
                  title="Push"
                  description="Append tracks of sources sequentially"
                  type="Combiner"
                />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Filters</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <DragableNode
                nodeType="Filter.dedupeTracks"
                title="Dedupe Tracks"
                description="Remove duplicate tracks"
                type="Filter"
              />
              <DragableNode
                nodeType="Filter.dedupeArtists"
                title="Dedupe Artists"
                description="Remove duplicate artists"
                type="Filter"
              />
              <DragableNode
                nodeType="Filter.filter"
                title="Remove Match"
                description="Match and remove tracks"
                type="Filter"
              />
              <DragableNode
                nodeType="Filter.limit"
                title="Limit"
                description="Limit number of tracks"
                type="Filter"
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Order</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <DragableNode
                nodeType="Order.sort"
                title="Sort"
                description="Sort tracks based on given key"
                type="Order"
              />
              <DragableNode
                nodeType="Order.shuffle"
                title="Shuffle"
                description="Randomly shuffle tracks"
                type="Order"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="flex flex-col gap-2 px-4 pb-4">
        <AlertDialog open={openAlert} onOpenChange={handleOpenChange}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alert?.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {alert?.message.split("\n").map((line, index) => (
                  <code>
                  <p key={index} className={index === 0 ? "font-medium" : ""}>
                    {line}
                  </p>
                  </code>
                ))}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={handleOpenChange}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex w-full gap-2">
          <Button className="flex-grow" onClick={handleRun}>
            <PlayIcon size={16} />
            <span>Run</span>
          </Button>
          <Button>
            <span>Dry Run</span>
          </Button>
        </div>
        <Button>Save Workflow</Button>
      </div>
    </aside>
  );
}

export default React.memo(Sidebar);