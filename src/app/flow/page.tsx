"use client";

import {
  type Edge,
  type Node,
  type Position,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";

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
import { useReactFlow } from "@xyflow/react";
import { useShallow } from 'zustand/react/shallow'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DragableNode } from "@/components/DragableNode";

import useStore from "../states/store";

type Data = {
  nodes: Node[];
  edges: Edge[];
};

// eslint-disable-next-line @next/next/no-async-client-component
function Builder() {
  const { data: session } = useSession();
  console.log(session);

  const {
    setNodes,
    setEdges
  } = useStore(useShallow((state) => ({
    setNodes: state.setNodes,
    setEdges: state.setEdges,
  })));

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
    fetch(`/api/user/${session?.user?.providerAccountId}/playlists`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        useStore.setState({ userPlaylists: data });
      }).catch((err) => {
        console.error(err);
      }
    );
  } , [session?.user?.providerAccountId]);

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
          <Flow/>
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