"use client";

import { type Edge, type Node } from "@xyflow/react";

// import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Flow from "../../components/Flow";

import useStore from "../states/store";
import Sidebar from "./Sidebar";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";

import useSWR from "swr";

import { useRouter } from "next/navigation";

function Builder({ searchParams }: { searchParams: any }) {
  const { data: session } = useSession();

  const flowId = searchParams.id;

  const router = useRouter();

  useEffect(() => {
    if (session) {
      setSessionStore(session);
    }
  }, [session]);

  const {
    setNodes,
    setEdges,
    setSessionStore,
    sessionStore,
    setUserPlaylists,
    setFlowState,
    reactFlowInstance,
  } = useStore((state) => ({
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    setSessionStore: state.setSession,
    sessionStore: state.session,
    setUserPlaylists: state.setUserPlaylists,
    setFlowState: state.setFlowState,
    reactFlowInstance: state.reactFlowInstance,
  }));

  const fetcher = async (url) => {
    const res = await fetch(url as string);
    if (!res.ok) {
      const error = {
        status: res.status,
        info: "An error occurred while fetching the data.",
      };
      const json = await res.json();
      error.info = json.error;
      throw error;
    }

    return res.json();
  };

  const {
    data: workflowData,
    error: workflowError,
    isLoading: workflowIsLoading,
  } = useSWR(flowId ? `/api/workflow/${flowId}` : null, fetcher) as {
    data: {
      id: string;
      workflow?: WorkflowObject;
      userId: string;
      createdAt: string;
      cron?: string;
    };
    error: {
      status: number;
      info: string;
    };
    isLoading: boolean;
  };

  useEffect(() => {
    if (workflowData === undefined && workflowError !== undefined) {
      toast.error(workflowError.info);
      router.push("/flow");
      return;
    }
    if (workflowData?.workflow !== undefined) {
      const { name, sources, operations, connections, description } =
        workflowData.workflow;
      if (
        sources.length > 0 &&
        operations.length > 0 &&
        connections.length > 0
      ) {
        const nodes = sources
          .map((item) => {
            return {
              ...item,
              ...item.rfstate,
            };
          })
          .concat(
            operations.map((item) => {
              return {
                ...item,
                ...item.rfstate,
              };
            }),
          ) as Node[];
        const edges = connections.map((item) => {
          return {
            id: `${item.source}->${item.target}`,
            source: item.source,
            target: item.target,
            type: item.type,
          };
        }) as Edge[];
        setNodes(nodes);
        setEdges(edges);
        setFlowState({
          id: flowId,
          name: name ?? "",
          description: description ?? "",
          workflow: workflowData.workflow,
        });
        reactFlowInstance?.fitView();
        toast.success(
          `Flow '${flowId}' loaded with ${nodes.length} nodes and ${edges.length} edges`,
        );
      } else {
        setFlowState({
          id: flowId,
          name: name ?? "",
          description: description ?? "",
          workflow: workflowData.workflow,
        });
        toast.info(
          `Flow '${flowId}' loaded with no nodes or edges. Please add some nodes and edges to continue.`,
        );
      }
    }
  }, [workflowData, workflowError]);

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
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            {workflowIsLoading && sessionStore === null ? (
              <div className="flex h-full items-center justify-center">
                <LoadingSVG />
                <div className="ml-2">Loading...</div>
              </div>
            ) : (
              <Flow />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}

const LoadingSVG = () => (
  <svg
    aria-hidden="true"
    className="inline h-4 w-4 animate-spin fill-gray-600 text-gray-200 dark:fill-gray-300 dark:text-gray-600"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="currentColor"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentFill"
    />
  </svg>
);

export default function Page({ searchParams }: { searchParams: any }) {
  return <Builder searchParams={searchParams} />;
}
