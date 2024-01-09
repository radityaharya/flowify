"use client";

import {
  type Edge,
  type Node,
  type Position,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";

// import styles from "./page.module.css";
import Flow from "../../components/Flow";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "src/components/ui/input";
// import {
//   CardTitle,
//   CardDescription,
//   CardHeader,
//   CardContent,
//   Card,
// } from "src/components/ui/card";
// import { Button } from "src/components/ui/button";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area"

// import { useCallback } from "react";
// import { useReactFlow } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DragableNode } from "@/components/DragableNode";

import useStore from "../states/store";

import Sidebar from "./Sidebar";

type Data = {
  nodes: Node[];
  edges: Edge[];
};

const nodeTypes = [
  {
    type: "Source.playlist",
    title: "Source",
    description: "Playlist source",
  },
  {
    type: "Combiner.alternate",
    title: "Alternate",
    description: "Alternate between playlists",
  },
  {
    type: "Filter.dedupeTracks",
    title: "Dedupe Tracks",
    description: "Remove duplicate tracks",
  },
];

function Builder() {
  const { data: session } = useSession();
  console.log(session);

  const { setSessionStore } = useStore(
    useShallow((state) => ({
      sessionStore: state.session,
      setSessionStore: state.setSession,
    })),
  );

  useEffect(() => {
    if (session) {
      setSessionStore(session);
    }
  }, [session]);

  const { setNodes, setEdges } = useStore(
    useShallow((state) => ({
      setNodes: state.setNodes,
      setEdges: state.setEdges,
    })),
  );

  useEffect(() => {
    fetch("/api/nodes")
      .then((response) => response.json() as Promise<Data>)
      .then((initData) => {
        console.log(initData);
        setNodes(initData.nodes);
        setEdges(initData.edges);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {

    if (!session?.user?.providerAccountId) {
      return;
    }
    fetch(`/api/user/${session?.user?.providerAccountId}/playlists`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        useStore.setState({ userPlaylists: data });
      })
      .catch((err) => {
        console.error(err);
      });
  }, [session?.user?.providerAccountId]);

  return (
    <div className="flex h-screen flex-col">
      <main className="grid h-screen grid-cols-5">
        <Sidebar />
        <div className="col-span-4 h-full overflow-auto">
          <Flow />
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <ReactFlowProvider>
      <Builder />
    </ReactFlowProvider>
  );
}
