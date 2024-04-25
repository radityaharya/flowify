/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import {
  Background,
  Controls,
  Panel,
  ReactFlow,
  getOutgoers,
} from "@xyflow/react";
import { useCallback, useMemo, useRef } from "react";

import useStore from "~/app/states/store";

import "@xyflow/react/dist/style.css";
import { useShallow } from "zustand/react/shallow";

import Alternate from "@nodes/Combiner/Alternate";
import Push from "@nodes/Combiner/Push";

import LikedTracks from "@nodes/Library/LikedTracks";
import Playlist from "@nodes/Library/Playlist";
import SaveAsAppend from "@nodes/Library/SaveAsAppend";
import SaveAsNew from "@nodes/Library/SaveAsNew";
import SaveAsReplace from "@nodes/Library/SaveAsReplace";

import DedupeArtists from "@nodes/Filter/DedupeArtists";
import DedupeTracks from "@nodes/Filter/DedupeTracks";
import Limit from "@nodes/Filter/Limit";
import RemoveMatch from "@nodes/Filter/RemoveMatch";

import Shuffle from "@nodes/Order/Shuffle";
import Sort from "@nodes/Order/Sort";
import SortPopularity from "@nodes/Order/SortPopularity";

import AllButFirst from "@nodes/Selectors/AllButFirst";
import AllButLast from "@nodes/Selectors/AllButLast";
import First from "@nodes/Selectors/First";
import Last from "@nodes/Selectors/Last";
import Recommend from "@nodes/Selectors/Recommend";

import { Button } from "@/components/ui/button";
import { PlayIcon, SaveIcon, Settings as SettingsIcon } from "lucide-react";
import { SettingsDialog } from "./settingsDialog/Settings";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import reactFlowToWorkflow from "~/app/utils/reactFlowToWorkflow";
import { saveWorkflow } from "~/app/utils/saveWorkflow";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { runWorkflow } from "~/app/utils/runWorkflow";

export const Nodes = {
  "Combiner.alternate": {
    title: "Alternate",
    node: Alternate,
    description: "Alternate between playlists",
  },
  "Combiner.push": {
    title: "Push",
    node: Push,
    description: "Append tracks of sources sequentially",
  },
  "Filter.dedupeTracks": {
    title: "Deduplicate Tracks",
    node: DedupeTracks,
    description: "Remove duplicate tracks",
  },
  "Filter.dedupeArtists": {
    title: "Deduplicate Artists",
    node: DedupeArtists,
    description: "Remove duplicate artists",
  },
  "Filter.filter": {
    title: "Filter",
    node: RemoveMatch,
    description: "Match and remove tracks",
  },
  "Filter.limit": {
    title: "Limit",
    node: Limit,
    description: "Limit number of tracks",
  },
  "Source.playlist": {
    title: "Playlist",
    node: Playlist,
    description: "Playlist source",
  },
  "Library.likedTracks": {
    title: "Liked Tracks",
    node: LikedTracks,
    description: "Liked tracks",
  },
  "Library.saveAsNew": {
    title: "Save as New",
    node: SaveAsNew,
    description: "Saves workflow output to a new playlist",
  },
  "Library.saveAsAppend": {
    title: "Save as Append",
    node: SaveAsAppend,
    description: "Saves workflow output to an existing playlist by appending",
  },
  "Library.saveAsReplace": {
    title: "Save as Replace",
    node: SaveAsReplace,
    description:
      "Saves workflow output to an existing playlist by replacing all tracks",
  },
  "Order.shuffle": {
    title: "Shuffle",
    node: Shuffle,
    description: "Randomly shuffle tracks",
  },
  "Order.sort": {
    title: "Sort",
    node: Sort,
    description: "Sort tracks based on given key",
  },
  "Order.sort-popularity": {
    title: "Sort Tracks by Popularity",
    node: SortPopularity,
    description: "Sort tracks based on popularity",
  },
  "Selector.allButFirst": {
    title: "All But First",
    node: AllButFirst,
    description: "Selects all but the first item from the input",
  },
  "Selector.allButLast": {
    title: "All But Last",
    node: AllButLast,
    description: "Selects all but the last item from the input",
  },
  "Selector.first": {
    title: "First",
    node: First,
    description: "Selects the first item from the input",
  },
  "Selector.last": {
    title: "Last",
    node: Last,
    description: "Selects the last item from the input",
  },
  "Selector.recommend": {
    title: "Recommend",
    node: Recommend,
    description: "Get a list of recommended tracks based on the input.",
  },
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
    getEdges,
    getNodes,
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
      getEdges: state.getEdges,
      getNodes: state.getNodes,
      onNodesDelete: state.onNodesDelete,
      flowState: state.flowState,
      reactFlowInstance: state.reactFlowInstance,
      setReactFlowInstance: state.setReactFlowInstance,
    })),
  );

  const router = useRouter();

  const nodeTypes = useMemo(() => Object.fromEntries(
    Object.entries(Nodes).map(([key, value]) => [key, value.node])
  ), []);

  const onDragDrop = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  
    const type = event.dataTransfer.getData("application/reactflow");
  
    if (typeof type === "undefined" || !type) {
      return;
    }
  
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
  }, [reactFlowInstance, addNode]);

  const isValidConnection = useCallback(
    (connection) => {
      const nodes = getNodes();
      const edges = getEdges();

      const target = nodes.find((node) => node.id === connection.target);
      const hasCycle = (node, visited = new Set()) => {
        if (visited.has(node.id)) return false;

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      if (hasCycle(target)) {
        toast.error("You can't create a cycle");
      }

      if (target?.id === connection.source) return false;
      return !hasCycle(target);
    },
    [getNodes, getEdges],
  );

  async function handleRun() {
    const { workflowResponse, errors } = await reactFlowToWorkflow({
      nodes,
      edges,
    });
    const _runResponse = await runWorkflow(workflowResponse);
  }

  async function handleSave() {
    const saveResponse = await saveWorkflow();
    router.push(`/workflow/${saveResponse.id}`);
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
          onDrop={onDragDrop}
          onDragOver={onDragDrop}
          onNodesDelete={onNodesDelete}
          isValidConnection={isValidConnection}
          fitView
          snapToGrid={true}
          nodeTypes={nodeTypes}
          snapGrid={[20, 20]}
          zoomOnDoubleClick={false}
          deleteKeyCode={["Backspace", "Delete"]}
          onPaneContextMenu={(e) => {
            e.preventDefault();
          }}
          minZoom={0.001}
          maxZoom={1}
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
            <p className="font-medium text-lg drop-shadow-lg">
              {flowState.name}
            </p>
            <p className="font-medium text-xs opacity-80">
              {" "}
              {flowState.description}
            </p>
          </Panel>
          <Background
            color="#aaaaaa"
            gap={20}
            className="bg-background"
            size={2}
            patternClassName="opacity-20"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
