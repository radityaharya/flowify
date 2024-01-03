"use client";

import {
  type Edge,
  type Node,
  type Position,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from "reactflow";

import styles from "./page.module.css";
import Flow from "../../components/Flow";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "src/components/ui/input";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "src/components/ui/card";
import { Button } from "src/components/ui/button";

import { useCallback } from "react";
import { useReactFlow } from "reactflow";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DragableNode } from "@/components/DragableNode";
const nodeSize = {
  width: 100,
  height: 40,
};

// this example uses some v12 features that are not released yet
const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Node 1" },
    position: { x: 250, y: 5 },
    width: 100,
    height: 40,
    // @ts-expect-error v12 feature
    handles: [
      {
        type: "source",
        position: "bottom" as Position,
        x: nodeSize.width * 0.5,
        y: nodeSize.height,
        width: 1,
        height: 1,
      },
    ],
  },
  {
    id: "2",
    data: { label: "Node 2" },
    position: { x: 100, y: 100 },
    width: 100,
    height: 40,
    // handles: [
    //   {
    //     type: 'source',
    //     position: 'bottom' as Position,
    //     x: nodeSize.width * 0.5,
    //     y: nodeSize.height,
    //     width: 1,
    //     height: 1,
    //   },
    //   {
    //     type: 'target',
    //     position: 'top' as Position,
    //     x: nodeSize.width * 0.5,
    //     y: 0,
    //     width: 1,
    //     height: 1,
    //   },
    // ],
  },
  {
    id: "3",
    data: { label: "Node 3" },
    position: { x: 400, y: 100 },
    width: 100,
    height: 40,
    // handles: [
    //   {
    //     type: 'source',
    //     position: 'bottom' as Position,
    //     x: nodeSize.width * 0.5,
    //     y: nodeSize.height,
    //     width: 1,
    //     height: 1,
    //   },
    //   {
    //     type: 'target',
    //     position: 'top' as Position,
    //     x: nodeSize.width * 0.5,
    //     y: 0,
    //     width: 1,
    //     height: 1,
    //   },
    // ],
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
];

// async function fetchData(): Promise<{ nodes: Node[]; edges: Edge[] }> {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({ nodes: initialNodes, edges: initialEdges });
//     }, 1000);
//   });
// }

type Data = {
  nodes: Node[];
  edges: Edge[];
};

// eslint-disable-next-line @next/next/no-async-client-component
function Builder() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { data: session } = useSession();

  const reactFlow = useReactFlow();

  useEffect(() => {
    fetch("/api/nodes")
      .then((response) => response.json() as Promise<Data>)
      .then((initData) => {
        console.log(initData);
        reactFlow.setNodes(initData.nodes);
        reactFlow.setEdges(initData.edges);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  return (
    <div className="flex h-screen flex-col dark">
      <main className="grid h-screen grid-cols-4">
        <aside className="col-span-1 flex max-h-screen flex-col border-r dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="flex-none px-4 pt-4">
            <div className="flex flex-col justify-between gap-6">
              <div className="flex flex-row justify-between">
                <div id="logo" className="text-2xl font-bold text-foreground">
                  <span>flowify</span>
                </div>
                <div className="flex flex-row gap-4 items-center">
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
          <div className="flex flex-col flex-grow overflow-auto border-r gap-4 p-4 dark:border-gray-800">
            <DragableNode nodeType="input" />
            <DragableNode nodeType="source" />
            <DragableNode nodeType="source" />
            <DragableNode nodeType="source" />
            <DragableNode nodeType="source" />
            <DragableNode nodeType="source" />
            <DragableNode nodeType="source" />
          </div>
        </aside>
        <div className="col-span-3 h-full overflow-auto">
          <Flow nodes={nodes} edges={edges} />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Builder />
    </ReactFlowProvider>
  );
}

// eslint-disable-next-line @next/next/no-async-client-component
// export default async function App() {
//   const { nodes, edges }: Data = await fetchData();

//   return (
//     <main className={styles.main}>
//       {/* @ts-expect-error dont */}
//       <ReactFlowProvider initialNodes={nodes} initialEdges={edges}>
//         <Flow nodes={nodes} edges={edges} />
//       </ReactFlowProvider>
//     </main>
//   );
// }

// export default function App() {
//   const [nodes, setNodes] = useState<Node[]>([]);
//   const [edges, setEdges] = useState<Edge[]>([]);

//   useEffect(() => {
//     fetchData()
//       .then((initData) => {
//         setNodes(initData.nodes);
//         setEdges(initData.edges);
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   }, []);

//   return (
//     <main className={styles.main}>
//       <ReactFlowProvider>
//         <Flow nodes={nodes} edges={edges} />
//       </ReactFlowProvider>
//     </main>
//   );
// }
