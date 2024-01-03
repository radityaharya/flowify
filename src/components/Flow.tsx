/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
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
} from 'reactflow';

import 'reactflow/dist/style.css';

import Source from './nodes/Source';

let id = 0;
const getId = () => `dndnode_${id++}`;

const snapGrid = [20, 20];

const nodeTypes = {
  source: Source,
};
export default function App({
  nodes: initNodes,
  edges: initEdges,
}: {
  nodes: Node[];
  edges: Edge[];
}) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // const onNodesChange: OnNodesChange = useCallback(
  //   (chs) => {
  //     setNodes((nds) => applyNodeChanges(chs, nds));
  //   },
  //   [setNodes]
  // );

  // const onEdgesChange: OnEdgesChange = useCallback(
  //   (chs) => {
  //     setEdges((eds) => applyEdgeChanges(chs, eds));
  //   },
  //   [setEdges]
  // );
  

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
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
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );

  // return (
  //     <ReactFlow
  //       nodes={nodes}
  //       edges={edges}
  //       onNodesChange={onNodesChange}
  //       onEdgesChange={onEdgesChange}
  //       onConnect={onConnect}
  //     >
  //       <Background color="#000" gap={24} />
  //     </ReactFlow>
  // );

  return (
    <div className="dndflow h-full w-full">
        <div className="reactflow-wrapper h-full w-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            snapToGrid={true}
            nodeTypes={nodeTypes}
            snapGrid={[20, 20]}
          >
            <Controls />
            <Background color="#aaa" gap={24} className='dark:bg-gray-800' />
          </ReactFlow>
        </div>
    </div>
  );
}