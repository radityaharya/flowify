import { create } from 'zustand';
import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  type OnNodesDelete
} from "@xyflow/react";

import { v4 as uuidv4 } from 'uuid';

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (data: any) => Node;
  addEdge: (data: any) => void;
  updateNodeData: (id: string, data: any) => void;
  onNodesDelete: (deleted: Node[]) => void;

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
  setAlert: (alert: {
    message: string;
    title: string;
    type: string;
  } | null) => void;
};

const useStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  setNodes: (nodes) => {  
    console.log('setNodes', nodes);
    set({
      nodes: nodes,
    });
  },
  setEdges: (edges) => {
    console.log('setEdges', edges);
    set({
      edges: edges,
    });
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
    const id = `${data.source}->${data.target}`
    const edge = { id, ...data };
    edge.type = 'smoothstep';
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
        ...data
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

        const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));

        const createdEdges = incomers.flatMap(({ id: source }) =>
          outgoers.map(({ id: target }) => ({ id: `${source}->${target}`, source, target }))
        );

        return [...remainingEdges, ...createdEdges];
      }, get().edges),
      // nodes: get().nodes.filter((node) => !deleted.includes(node)),
    });
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
  setAlert: (alert: {
    message: string;
    title: string;
    type: string;
  } | null) => {
    set({
      alert: alert,
    });
  },
}));

export default useStore;
