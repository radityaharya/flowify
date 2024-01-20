/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  SelectionMode,
  type ReactFlowInstance,
} from "@xyflow/react";

import useStore from "~/app/states/store";

import "@xyflow/react/dist/style.css";
import { useShallow } from "zustand/react/shallow";

import Alternate from "./nodes/Combiner/Alternate";
import Push from "./nodes/Combiner/Push";

import Playlist from "./nodes/Library/Playlist";
import LikedTracks from "./nodes/Library/LikedTracks";
import SaveAsNew from "./nodes/Library/SaveAsNew";
import SaveAsAppend from "./nodes/Library/SaveAsAppend";
import SaveAsReplace from "./nodes/Library/SaveAsReplace";

import DedupeTracks from "./nodes/Filter/DedupeTracks";
import RemoveMatch from "./nodes/Filter/RemoveMatch";
import DedupeArtists from "./nodes/Filter/DedupeArtists";
import Limit from "./nodes/Filter/Limit";

import Shuffle from "./nodes/Order/Shuffle";
import Sort from "./nodes/Order/Sort";

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
  } = useStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      addEdge: state.addEdge,
      addNode: state.addNode,
      onNodesDelete: state.onNodesDelete,
    })),
  );

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

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
          // fitView
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
