"use client";

import { type Edge, type Node, ReactFlowProvider } from "@xyflow/react";

// import styles from "./page.module.css";
import Flow from "../../components/Flow";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

import useStore from "../states/store";

import Sidebar from "./Sidebar";
import RightBar from "./RightBar";
import { notFound, redirect } from "next/navigation";


import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"


import { useRouter } from "next/navigation";

type Data = {
  nodes: Node[];
  edges: Edge[];
};

function Builder({ searchParams }: { searchParams: any }) {
  const { data: session } = useSession();

  const flowId = searchParams.id;

  const router = useRouter();

  useEffect(() => {
    if (session) {
      setSessionStore(session);
    }
  }, [session]);

  const { setNodes, setEdges, setSessionStore, setUserPlaylists, setAlert } =
    useStore((state) => ({
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      setSessionStore: state.setSession,
      setUserPlaylists: state.setUserPlaylists,
      setAlert: state.setAlert,
    }));

  useEffect(() => {
    if (flowId) {
      fetch(`/api/nodes/${flowId}`)
        .then(async (response) => {
          if (response.status === 404) {
            setAlert({
              title: "Error",
              type: "error",
              message: `Flow '${flowId}' not found`,
            });
            router.replace("/flow");
            return { nodes: [], edges: [] };
          } else {
            return response.json() as Promise<Data>;
          }
        })
        .then((initData) => {
          console.log(initData);
          setNodes(initData.nodes);
          setEdges(initData.edges);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  useEffect(() => {
    if (!session?.user?.providerAccountId) {
      return;
    }
    fetch(`/api/user/${session?.user?.providerAccountId}/playlists`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setUserPlaylists(data as any[]);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [session?.user?.providerAccountId]);

  return (
    <div className="flex h-screen flex-col">
      <main className="grid h-screen">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} maxSize={50} minSize={20}>
            <Sidebar />
          </ResizablePanel>
          <ResizableHandle withHandle/>
          <ResizablePanel defaultSize={80}>
              <Flow />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: any }) {
  return (
    // <ReactFlowProvider>
      <Builder searchParams={searchParams} />
    // </ReactFlowProvider>
  );
}
