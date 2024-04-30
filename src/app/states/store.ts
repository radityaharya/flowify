import {
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type ReactFlowInstance,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  getConnectedEdges,
  getIncomers,
  getOutgoers,
} from "@xyflow/react";
import { generate } from "random-words";
import { create } from "zustand";

import { v4 as uuidv4 } from "uuid";

type RFState = {
  rightBarSize: number;
  nodes: Node[];
  edges: Edge[];
  reactFlowInstance?: ReactFlowInstance;
  flowState: {
    id?: string | null;
    name: string;
    description: string;
    workflow?: WorkflowObject;
    cron?: string;
    dryrun?: boolean;
  };

  setRightBarSize: (size: number) => void;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

  setNode: (id: string, node: Node) => void;

  addNode: (data: any) => Node;
  addEdge: (data: any) => void;
  updateNodeData: (id: string, data: any) => void;
  onNodesDelete: (deleted: Node[]) => void;

  getNode: (id: string) => Node | undefined;
  getEdge: (id: string) => Edge | undefined;
  getNodes: () => Node[];
  getEdges: () => Edge[];

  userPlaylists: any[];
  setUserPlaylists: (playlists: any[]) => void;
  getUserPlaylists: () => any[];

  session: any;
  setSession: (session: any) => void;

  alert: {
    message: string;
    title: string;
    type: string;
  } | null;
  setAlert: (
    alert: {
      message: string;
      title: string;
      type: string;
    } | null,
  ) => void;
  setFlowState: (flowState: {
    id?: string | null;
    name: string;
    description: string;
    workflow?: WorkflowObject;
    cron?: string;
    dryrun?: boolean;
  }) => void;
  setReactFlowInstance: (instance: ReactFlowInstance) => void;
  resetReactFlow: () => void;
};

const useStore = create<RFState>((set, get) => ({
  rightBarSize: 0,
  nodes: [],
  edges: [],
  flowState: {
    id: undefined,
    name: "",
    description: "",
    workflow: undefined,
    dryrun: true,
  },
  reactFlowInstance: undefined,

  setRightBarSize: (size: number) => {
    set({
      rightBarSize: size,
    });
  },

  setNodes: (nodes) => {
    console.debug("setNodes", nodes);
    set({
      nodes: nodes,
    });
  },
  setEdges: (edges) => {
    console.debug("setEdges", edges);
    set({
      edges: edges,
    });
  },
  setNode(id: string, node: Node) {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? node : n)),
    }));
  },
  onNodesChange(changes) {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange(changes) {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode(data) {
    const id = uuidv4();
    const node = { id, ...data };
    set({ nodes: [node, ...get().nodes] });
    return node;
  },
  addEdge(data) {
    const id = `${data.source}->${data.target}`;
    const edge = { id, ...data };
    set({ edges: [edge, ...get().edges] });
  },
  updateNode: (node: Node) => {
    const nodes = get().nodes;
    const index = nodes.findIndex((n) => n.id === node.id);
    if (index === -1) {
      return;
    }
    nodes[index] = node;
    set({
      nodes: nodes,
    });
  },
  updateNodeData: (id: string, data: any) => {
    const nodes = get().nodes;
    const index = nodes.findIndex((n) => n.id === id);
    if (index !== -1 && nodes[index]) {
      nodes[index]!.data = {
        ...nodes[index]!.data,
        ...data,
      };
      set({
        nodes: nodes,
      });
    }
  },
  onNodesDelete: (deleted) => {
    set({
      edges: deleted.reduce((acc, node) => {
        const incomers = getIncomers(node, get().nodes, get().edges);
        const outgoers = getOutgoers(node, get().nodes, get().edges);
        const connectedEdges = getConnectedEdges([node], get().edges);

        const remainingEdges = acc.filter(
          (edge) => !connectedEdges.includes(edge),
        );

        const createdEdges = incomers.flatMap(({ id: source }) =>
          outgoers.map(({ id: target }) => ({
            id: `${source}->${target}`,
            source,
            target,
          })),
        );

        return [...remainingEdges, ...createdEdges];
      }, get().edges),
      // nodes: get().nodes.filter((node) => !deleted.includes(node)),
    });
  },

  getNode: (id: string) => {
    const node = get().nodes.find((node) => node.id === id);
    // console.log("Node ID:", id);
    // console.log("Node Data:", node?.data);
    return node;
  },
  getEdge: (id: string) => {
    return get().edges.find((edge) => edge.id === id);
  },
  getNodes: () => {
    return get().nodes;
  },
  getEdges: () => {
    return get().edges;
  },
  setFlowState: (flowState) => {
    set({
      flowState: flowState,
    });
  },
  setReactFlowInstance: (instance) => {
    set({
      reactFlowInstance: instance,
    });
  },
  resetReactFlow: () => {
    function generateName() {
      let name = generate({ exactly: 2, join: " " });
      return name.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
    }
    set({
      nodes: [],
      edges: [],
      flowState: {
        id: undefined,
        name: generateName(),
        description: "We named it, but you can change it in the settings 😄",
        workflow: undefined,
        dryrun: true,
      },
    });

    get().reactFlowInstance?.fitView();
    get().reactFlowInstance?.zoomTo(1);
  },

  // user playlists
  userPlaylists: [],
  setUserPlaylists: (playlists) => {
    set({
      userPlaylists: playlists,
    });
  },
  getUserPlaylists: () => {
    return get().userPlaylists;
  },

  // session
  session: null,
  setSession: (session) => {
    set({
      session: session,
    });
  },

  // alert
  alert: null,
  setAlert: (
    alert: {
      message: string;
      title: string;
      type: string;
    } | null,
  ) => {
    set({
      alert: alert,
    });
  },
}));

type WorkflowRunState = {
  workflowRun: QueueResponse | null;
  setWorkflowRun: (workflowRun: QueueResponse) => void;
  resetWorkflowRun: () => void;
};

export const workflowRunStore = create<WorkflowRunState>((set, get) => ({
  workflowRun: null,
  setWorkflowRun: (workflowRun) => {
    console.info("workflowRun", workflowRun);
    set({
      workflowRun: workflowRun,
    });
  },
  resetWorkflowRun: () => {
    set({
      workflowRun: null,
    });
  },
}));
  
export default useStore;
