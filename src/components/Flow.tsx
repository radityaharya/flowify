/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  type Node,
  type Edge,
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  Background,
  Controls,
  useEdgesState,
  useNodesState,
  ReactFlowProvider,
  ReactFlowInstance,
} from "@xyflow/react";

import useStore from "~/app/states/store";

import { v4 as uuidv4 } from "uuid";

import "@xyflow/react/dist/style.css";

import Playlist from "./nodes/Source/Playlist";
import Alternate from "./nodes/Combiner/Alternate";

import { useShallow } from 'zustand/react/shallow'

const nodeTypes = {
  "Source.playlist": Playlist,
  "Combiner.alternate": Alternate,
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
    setNodes,
    setEdges,
  } = useStore(useShallow((state) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    addEdge: state.addEdge,
    addNode: state.addNode,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
  })));

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
        id: uuidv4(),
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
          // fitView
          // snapToGrid={true}
          nodeTypes={nodeTypes}
          // snapGrid={[20, 20]}
          zoomOnPinch={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
        >
          <Controls />
          <Background color="#aaa" gap={24} className="dark:bg-gray-800" />
        </ReactFlow>
      </div>
    </div>
  );
}
