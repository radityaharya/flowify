"use client";

import "@xyflow/react/dist/style.css";

import Alternate from "@nodes/Combiner/Alternate";
import Push from "@nodes/Combiner/Push";
import RandomStream from "@nodes/Combiner/RandomStream";
import DedupeArtists from "@nodes/Filter/DedupeArtists";
import DedupeTracks from "@nodes/Filter/DedupeTracks";
import Limit from "@nodes/Filter/Limit";
import RemoveMatch from "@nodes/Filter/RemoveMatch";
import AlbumTracks from "@nodes/Library/AlbumTracks";
import ArtistsTopTracks from "@nodes/Library/ArtistsTopTracks";
import LikedTracks from "@nodes/Library/LikedTracks";
import MyTopTracks from "@nodes/Library/MyTopTracks";
import Playlist from "@nodes/Library/Playlist";
import SaveAsAppend from "@nodes/Library/SaveAsAppend";
import SaveAsNew from "@nodes/Library/SaveAsNew";
import SaveAsReplace from "@nodes/Library/SaveAsReplace";
import Reverse from "@nodes/Order/Reverse";
import SeparateArtists from "@nodes/Order/SeparateArtists";
import Shuffle from "@nodes/Order/Shuffle";
import Sort from "@nodes/Order/Sort";
import SortPopularity from "@nodes/Order/SortPopularity";
import AllButFirst from "@nodes/Selectors/AllButFirst";
import AllButLast from "@nodes/Selectors/AllButLast";
import First from "@nodes/Selectors/First";
import Last from "@nodes/Selectors/Last";
import Recommend from "@nodes/Selectors/Recommend";
import {
  Background,
  Controls,
  getOutgoers,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import { PlayIcon, SaveIcon, Settings as SettingsIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { useShallow } from "zustand/react/shallow";

import { fetcher } from "@/app/utils/fetcher";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useStore from "~/app/states/store";
import reactFlowToWorkflow from "~/app/utils/reactFlowToWorkflow";
import { runWorkflow } from "~/app/utils/runWorkflow";
import { saveWorkflow } from "~/app/utils/saveWorkflow";

import { SettingsDialog } from "./settingsDialog/Settings";

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
  "Combiner.randomStream": {
    title: "Random Stream",
    node: RandomStream,
    description: "Randomly select tracks from sources",
  },
  "Filter.dedupeTracks": {
    title: "Dedup Tracks",
    node: DedupeTracks,
    description: "Remove duplicate tracks",
  },
  "Filter.dedupeArtists": {
    title: "Dedup Artists",
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
  "Library.playlistTracks": {
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
  "Library.albumTracks": {
    title: "Album",
    node: AlbumTracks,
    description: "Album source",
  },
  "Library.artistsTopTracks": {
    title: "Artists Top Tracks",
    node: ArtistsTopTracks,
    description: "Top tracks of artists",
  },
  "Library.myTopTracks": {
    title: "My Top Tracks",
    node: MyTopTracks,
    description: "Your top tracks",
  },
  "Order.shuffle": {
    title: "Shuffle",
    node: Shuffle,
    description: "Randomly shuffle tracks",
  },
  "Order.reverse": {
    title: "Reverse",
    node: Reverse,
    description: "Reverse the order of tracks",
  },
  "Order.separateArtists": {
    title: "Separate Artists",
    node: SeparateArtists,
    description: "Sort tracks based on artists",
  },
  "Order.sort": {
    title: "Sort",
    node: Sort,
    description: "Sort tracks based on given key",
  },
  "Order.sort-popularity": {
    title: "By Popularity",
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

export const nodeTypes = Object.fromEntries(
  Object.entries(Nodes).map(([key, value]) => [key, value.node]),
);

export function App() {
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
    setNode,
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
      setNode: state.setNode,
      onNodesDelete: state.onNodesDelete,
      flowState: state.flowState,
      reactFlowInstance: state.reactFlowInstance,
      setReactFlowInstance: state.setReactFlowInstance,
    })),
  );

  const router = useRouter();
  const path = usePathname();

  const onDragDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      const url = event.dataTransfer.getData("text/plain");
      let host;
      try {
        host = new URL(url).host;
      } catch (e) {
        console.error("Invalid URL:", url);
        return;
      }
      const allowedHosts = ["open.spotify.com", "play.spotify.com"];

      if (allowedHosts.includes(host) && url.includes("/playlist/")) {
        const position = reactFlowInstance!.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const playlistId = url.split("/playlist/")[1];

        const placeholderNode = {
          id: `placeholder-${playlistId}`,
          type: "Library.playlistTracks",
          position,
          data: {
            id: `placeholder-${playlistId}`,
            playlistId: `placeholder-${playlistId}`,
            name: "Loading...",
            description: "",
            image: "",
            total: 0,
            owner: "",
          },
        };

        const placeholder = addNode(placeholderNode);

        fetch(`/api/user/@me/playlist/${playlistId}`)
          .then((response) => response.json())
          .then((data) => {
            const newNode = {
              ...placeholderNode,
              id: data.id,
              data: {
                id: data.id,
                playlistId: data.id,
                name: data.name,
                description: data.description,
                image: data.image,
                total: data.total,
                owner: data.owner,
              },
            };

            setNode(placeholder.id, newNode);
          })
          .catch((error) => {
            console.error("Error fetching playlist details:", error);
          });
      } else {
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
      }
    },
    [reactFlowInstance, addNode, setNode],
  );

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
    if (errors.length > 0) {
      console.error("Errors in workflow", errors);
      return;
    }
    const _runResponse = await runWorkflow(workflowResponse);
  }

  async function handleSave() {
    try {
      const saveResponse = await saveWorkflow();
      const formattedName = saveResponse.workflow.name
        .replace(/ /g, "-")
        .toLowerCase();

      const match = /\/workflow\/(.*?)_/.exec(path);
      const curName = match?.[1];

      if (formattedName !== curName) {
        console.log(
          "redirecting to",
          `/workflow/${formattedName}_${saveResponse.id}`,
        );
        router.replace(`/workflow/${formattedName}_${saveResponse.id}`);
      }
    } catch (error) {
      console.error("Error saving workflow", error);
    }
  }

  const { data: systemInfo, isLoading: workerLoading } =
    useSWR<Workflow.SystemInfo>("/api/systeminfo", fetcher, {
      refreshInterval: 10000,
    });

  const edgeOptions = {
    animated: true,
  };

  const setDryRun = useCallback(
    (dryrun: boolean) => {
      useStore.setState({ flowState: { ...flowState, dryrun } });
      console.info("Dryrun set to", flowState.dryrun);
    },
    [flowState],
  );

  return (
    <div className="dndflow size-full">
      <div className="reactflow-wrapper size-full" ref={reactFlowWrapper}>
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
          nodeTypes={nodeTypes}
          zoomOnDoubleClick={false}
          deleteKeyCode={["Backspace", "Delete"]}
          onPaneContextMenu={(e) => {
            e.preventDefault();
          }}
          minZoom={0.001}
          maxZoom={1}
          defaultEdgeOptions={edgeOptions}
        >
          <Controls />
          <Panel position="top-right" className="select-none pt-20">
            <div className="flex flex-row items-center gap-4">
              <Button className="grow space-x-2" onClick={handleSave}>
                <SaveIcon size={16} />
                <span>Save</span>
              </Button>
              <div className="flex flex-row items-center justify-center gap-4 whitespace-nowrap rounded-md bg-card pr-4 text-sm font-medium text-foreground outline outline-1 outline-slate-700 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="grow space-x-2"
                        onClick={handleRun}
                        disabled={
                          workerLoading ||
                          (typeof systemInfo?.systemStatus === "object" &&
                            systemInfo.systemStatus?.status === "error") ||
                          flowState.id === undefined
                        }
                      >
                        <PlayIcon size={16} />
                        <span>Run</span>
                      </Button>
                    </TooltipTrigger>
                    {(workerLoading ||
                      (typeof systemInfo?.systemStatus === "object" &&
                        systemInfo.systemStatus?.status === "error") ||
                      flowState.id === undefined) && (
                      <TooltipContent
                        side={"bottom"}
                        className="flex flex-col gap-2"
                      >
                        {flowState.id === undefined
                          ? "Create your workflow first before running"
                          : typeof systemInfo?.systemStatus === "object" &&
                              systemInfo.systemStatus?.status === "error"
                            ? "System is unable to run workflows"
                            : "Save your workflow before running it."}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={flowState.dryrun}
                    id="dryrun"
                    onClick={(e) => setDryRun(!flowState.dryrun)}
                  />
                  <label
                    htmlFor="dryrun"
                    className="font-base text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Save to Spotify
                  </label>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex flex-row gap-2 bg-card text-foreground outline outline-1 outline-slate-700 hover:bg-opacity-100 hover:text-background">
                    <SettingsIcon size={16} />
                    Settings
                  </Button>
                </DialogTrigger>
                <SettingsDialog />
              </Dialog>
            </div>
          </Panel>
          <Panel position="top-left" className="pt-20">
            <p className="text-lg font-medium drop-shadow-lg">
              {flowState.name}
            </p>
            <p className="text-xs font-medium opacity-80">
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
export default App;
