/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import reactFlowToWorkflow from "@/app/utils/reactFlowToWorkflow";

import useStore from "@/app/states/store";
import { DragableNode } from "@/components/DragableNode";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import React from "react";
import { useShallow } from "zustand/react/shallow";
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

  const onDrop = (_event) => {
    return;
  };

  function handleRun() {
    const workflow = reactFlowToWorkflow({ nodes, edges });
    const blob = new Blob([JSON.stringify(workflow)], {
      type: "application/json",
    });
    const _url = URL.createObjectURL(blob);
    const _link = document.createElement("a");
    // link.download = "workflow.json";
    // link.href = url;
    // link.click();
  }

  const [_openAlert, setOpenAlert] = useState(false);

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
      className="col-span-1 flex h-full max-h-screen select-none flex-col justify-between border-r"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex flex-col gap-6">
        <div className="flex-none px-6 pt-[4rem]">
          <div className="flex flex-col justify-between gap-6">
            <div className="flex flex-row justify-between"></div>
          </div>
        </div>
        <div className="flex flex-col gap-1 px-6">
          <h2 className="font-bold tracking-wider">Workflow Builder</h2>
          <p className="flex flex-row gap-1 font-normal text-xs opacity-80">
            Drag and drop nodes to the canvas to create a workflow
          </p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="px-6"
          defaultValue="item-1"
        >
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
              <DragableNode
                nodeType="Library.saveAsAppend"
                title="Save as append"
                description="Saves workflow output to an existing playlist by appending"
                type="Target"
              />
              <DragableNode
                nodeType="Library.saveAsReplace"
                title="Save as replace"
                description="Saves workflow output to an existing playlist by replacing all tracks"
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
          <AccordionItem value="item-5">
            <AccordionTrigger>Selectors</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <DragableNode
                nodeType="Selector.first"
                title="First"
                description="Selects the first item from the input"
                type="Selector"
              />
              <DragableNode
                nodeType="Selector.last"
                title="Last"
                description="Selects the last item from the input"
                type="Selector"
              />
              <DragableNode
                nodeType="Selector.allButFirst"
                title="All But First"
                description="Selects all but the first item from the input"
                type="Selector"
              />
              <DragableNode
                nodeType="Selector.allButlast"
                title="All But Last"
                description="Selects all but the last item from the input"
                type="Selector"
              />
              <DragableNode
                nodeType="Selector.recommend"
                title="Recommend"
                description="Get a list of recommended tracks based on the input." 
                type="Selector"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
}

export default React.memo(Sidebar);
