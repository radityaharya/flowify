/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import { Background, Controls, Panel, ReactFlow } from "@xyflow/react";
import React, { useCallback, useRef } from "react";

import useStore from "~/app/states/store";

import "@xyflow/react/dist/style.css";
import { useShallow } from "zustand/react/shallow";

import Alternate from "./nodes/Combiner/Alternate";
import Push from "./nodes/Combiner/Push";

import LikedTracks from "./nodes/Library/LikedTracks";
import Playlist from "./nodes/Library/Playlist";
import SaveAsAppend from "./nodes/Library/SaveAsAppend";
import SaveAsNew from "./nodes/Library/SaveAsNew";
import SaveAsReplace from "./nodes/Library/SaveAsReplace";

import DedupeArtists from "./nodes/Filter/DedupeArtists";
import DedupeTracks from "./nodes/Filter/DedupeTracks";
import Limit from "./nodes/Filter/Limit";
import RemoveMatch from "./nodes/Filter/RemoveMatch";

import Shuffle from "./nodes/Order/Shuffle";
import Sort from "./nodes/Order/Sort";

import { Button } from "@/components/ui/button";
import { PlayIcon, SaveIcon, Settings as SettingsIcon } from "lucide-react";
import { SettingsDialog } from "./settingsDialog/Settings";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import reactFlowToWorkflow from "~/app/utils/reactFlowToWorkflow";
import { saveWorkflow } from "~/app/utils/saveWorkflow";

import { useRouter } from "next/navigation";
import { runWorkflow } from "~/app/utils/runWorkflow";

const nodeTypes = {
  "Combiner.alternate": Alternate,
  "Combiner.push": Push,

  "Filter.dedupeTracks": DedupeTracks,
  "Filter.dedupeArtists": DedupeArtists,
  "Filter.filter": RemoveMatch,
  "Filter.limit": Limit,

  "Source.playlist": Playlist,
  "Library.likedTracks": LikedTracks,
  "Library.saveAsNew": SaveAsNew,
  "Library.saveAsAppend": SaveAsAppend,
  "Library.saveAsReplace": SaveAsReplace,

  "Order.shuffle": Shuffle,
  "Order.sort": Sort,
};
export default function App() {
  const reactFlowWrapper = useRef(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addEdge,
    addNode,
    onNodesDelete,
    flowState,
    reactFlowInstance,
    setReactFlowInstance,
  } = useStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      addEdge: state.addEdge,
      addNode: state.addNode,
      onNodesDelete: state.onNodesDelete,
      flowState: state.flowState,
      reactFlowInstance: state.reactFlowInstance,
      setReactFlowInstance: state.setReactFlowInstance,
    })),
  );

  const router = useRouter();

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlowInstance!.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        type,
        position,
        data: {},
      };

      addNode(newNode);
    },
    [reactFlowInstance],
  );

  async function handleRun() {
    const { workflowResponse, errors } = await reactFlowToWorkflow({
      nodes,
      edges,
    });
    const runResponse = await runWorkflow(workflowResponse);
  }

  async function handleSave() {
    const { workflowResponse, errors } = await reactFlowToWorkflow({
      nodes,
      edges,
    });
    const saveResponse = await saveWorkflow(workflowResponse);
    router.push(`/flow?id=${saveResponse.id}`);
  }

  return (
    <div className="dndflow h-full w-full">
      <div className="reactflow-wrapper h-full w-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={addEdge}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodesDelete={onNodesDelete}
          fitView
          snapToGrid={true}
          nodeTypes={nodeTypes}
          snapGrid={[20, 20]}
          // zoomOnPinch={false}
          // zoomOnScroll={false}
          zoomOnDoubleClick={false}
          deleteKeyCode={["Backspace", "Delete"]}
          onPaneContextMenu={(e) => {
            e.preventDefault();
          }}
          minZoom={0.001}
          maxZoom={1}
          // // figma like
          // panOnScroll
          // selectionOnDrag
          // panOnDrag={[1, 2]}
          // selectionMode={SelectionMode.Partial}
        >
          <Controls />
          <Panel position="top-right" className="pt-20">
            <div className="flex flex-row items-center gap-4">
              <Button className="flex-grow" onClick={handleSave}>
                <SaveIcon size={16} />
                <span>Save</span>
              </Button>
              <Button className="flex-grow" onClick={handleRun}>
                <PlayIcon size={16} />
                <span>Run</span>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex flex-row gap-2 bg-card bg-opacity-80 text-foreground outline outline-1 outline-slate-700 hover:bg-opacity-100 hover:text-background">
                    <SettingsIcon size={16} className="opacity-80" />
                    Settings
                  </Button>
                </DialogTrigger>
                <SettingsDialog />
              </Dialog>
            </div>
          </Panel>
          <Panel position="top-left" className="pt-20">
            <p className="text-lg font-medium drop-shadow-lg">
              {flowState.name}
            </p>
            <p className="text-xs font-medium opacity-80">
              {" "}
              {flowState.description}
            </p>
          </Panel>
          <Background
            color="#aaaaaa"
            gap={20}
            className="dark:bg-gray-800"
            size={2}
            patternClassName="opacity-20"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
