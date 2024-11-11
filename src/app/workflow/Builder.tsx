"use client";

import { type Edge, type Node } from "@xyflow/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { memo, useCallback, useEffect, useRef } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import useStore from "@/app/states/store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { LoadingWithText } from "~/components/LoadingSpinner";
import { useWorkflowData } from "~/hooks/useWorkflowData";

import Flow from "./Flow";
import Sidebar from "./Sidebar";

function Builder({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: any;
}) {
  const { data: session } = useSession();

  const flowId = params.id;

  const router = useRouter();

  useEffect(() => {
    if (session) {
      setSessionStore(session);
    }
  }, [session]);

  const {
    rightBarSize,
    setNodes,
    setEdges,
    setSessionStore,
    setUserPlaylists,
    sessionStore,
    flowState,
    setFlowState,
    reactFlowInstance,
    resetReactFlow,
  } = useStore(
    useShallow((state) => ({
      rightBarSize: state.rightBarSize,
      setRightBarSize: state.setRightBarSize,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      setSessionStore: state.setSession,
      sessionStore: state.session,
      flowState: state.flowState,
      setFlowState: state.setFlowState,
      setUserPlaylists: state.setUserPlaylists,
      resetReactFlow: state.resetReactFlow,
      reactFlowInstance: state.reactFlowInstance,
    })),
  );

  const {
    data: workflowData,
    error: workflowError,
    isLoading: workflowIsLoading,
    mutate: workflowMutate,
  } = useWorkflowData(flowId);

  const handleWorkflowData = useCallback(() => {
    console.log("handleWorkflowData called");

    if (workflowData === undefined && workflowError !== undefined) {
      toast.error(workflowError.info);
      router.push("/workflow");
      return;
    }
    if (workflowData?.workflow) {
      const { name, operations, connections, description } =
        workflowData.workflow;

      const formatedName = name.replace(/ /g, "-").toLowerCase();
      const curName = params.id.split("_")[0];

      if (formatedName !== curName) {
        router.push(`/workflow/${formatedName}_${workflowData.id}`);
      }

      if (operations.length > 0 && connections.length > 0) {
        const nodes = operations.map((item) => {
          return {
            ...item,
            ...item.rfstate,
          };
        }) as Node[];
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
          dryrun: true,
          cron: workflowData.cron,
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
          dryrun: true,
        });
        toast.info(
          `Flow '${flowId}' loaded with no nodes or edges. Please add some nodes and edges to continue.`,
        );
      }
      console.info("init flowstate", flowState);
    } else {
      console.info("RESET!");
      workflowMutate();
      resetReactFlow();
    }
  }, [
    workflowData,
    workflowError,
    flowId,
    reactFlowInstance,
    setEdges,
    setFlowState,
    setNodes,
    params.id,
    router,
    workflowMutate,
    resetReactFlow,
  ]);

  useEffect(() => {
    if (!flowId) {
      handleWorkflowData();
    } else if (workflowData !== undefined) {
      handleWorkflowData();
    }
  }, [flowId, workflowData, handleWorkflowData]);

  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  const resizePanel = useCallback(
    (size: number) => {
      if (rightPanelRef.current) {
        rightPanelRef.current.resize(size);
      }
    },
    [rightPanelRef],
  );

  useEffect(() => {
    resizePanel(rightBarSize);
  }, [rightBarSize, resizePanel]);

  return (
    <div className="flex h-screen flex-col">
      <main className="grid h-screen">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={17} maxSize={17} minSize={17}>
            <Sidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={83}>
            {workflowIsLoading || !session?.user ? <Loading /> : <Flow />}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={0} minSize={0} ref={rightPanelRef}>
            {/* <RightBar /> */}
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}

const Loading = memo(() => (
  <div className="flex h-full items-center justify-center">
    <LoadingWithText size={24} />
  </div>
));

Loading.displayName = "Loading";

export default Builder;
