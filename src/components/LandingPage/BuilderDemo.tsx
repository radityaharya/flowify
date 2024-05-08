"use client";
import { nodeTypes } from "@/app/workflow/Flow";
import {
  Edge,
  Node,
  ReactFlow,
  ReactFlowProvider,
  ReactFlowState,
  getNodesBounds,
  useReactFlow,
  useStore,
  useStoreApi,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState } from "react";

const proOptions = {
  hideAttribution: true,
};

const initialState = {
  color: "#777",
  zoom: 0.7,
  shape: "cube",
};

// {
//   "nodes": [
//       {
//           "id": "ab849a87-5615-47db-8494-08c1a2691452",
//           "type": "Library.saveAsReplace",
//           "position": {
//               "x": 901,
//               "y": 325
//           },
//           "data": {
//               "id": "48oIVyOtTlttINc7rYq0PZ",
//               "playlistId": "48oIVyOtTlttINc7rYq0PZ",
//               "name": "Daily Mixes",
//               "description": "",
//               "image": "https://mosaic.scdn.co/640/ab67616d00001e02871062e86dc8a76683b66019ab67616d00001e029c93931e7cfa4d8216056795ab67616d00001e02b91b4ade012ef3a2448e3a96ab67616d00001e02ee0ec368f9b61f602365d864",
//               "total": 1057,
//               "owner": "null"
//           },
//           "measured": {
//               "width": 350,
//               "height": 306
//           },
//           "selected": true
//       },
//       {
//           "id": "7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41",
//           "type": "Combiner.alternate",
//           "position": {
//               "x": 451,
//               "y": 325
//           },
//           "data": {
//               "playlistIds": [
//                   "37i9dQZF1E38EJlcnVuskA",
//                   "37i9dQZF1E35j9i7QVX8Xe"
//               ],
//               "playlists": [
//                   {
//                       "playlistId": "37i9dQZF1E38EJlcnVuskA",
//                       "name": "Daily Mix 2",
//                       "description": "Men I Trust, Jakob, Vansire and more",
//                       "image": "https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebfd30ebd7e80dad6b2383aab0/2/en/large",
//                       "owner": "Spotify",
//                       "total": 50
//                   },
//                   {
//                       "playlistId": "37i9dQZF1E35j9i7QVX8Xe",
//                       "name": "Daily Mix 1",
//                       "description": "Dreane, .Feast, Efek Rumah Kaca and more",
//                       "image": "https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebcb772c04cf4b9be21d6d7493/1/en/large",
//                       "owner": "Spotify",
//                       "total": 50
//                   }
//               ]
//           },
//           "measured": {
//               "width": 350,
//               "height": 394
//           },
//           "selected": false,
//           "dragging": false
//       },
//       {
//           "id": "a722dab7-ab8e-44f2-b390-458f2bc5f49c",
//           "type": "Library.playlistTracks",
//           "position": {
//               "x": 17,
//               "y": 443
//           },
//           "data": {
//               "playlistIds": [],
//               "playlists": [],
//               "playlistId": "37i9dQZF1E38EJlcnVuskA",
//               "name": "Daily Mix 2",
//               "description": "Men I Trust, Jakob, Vansire and more",
//               "image": "https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebfd30ebd7e80dad6b2383aab0/2/en/large",
//               "total": 50,
//               "owner": "Spotify"
//           },
//           "measured": {
//               "width": 350,
//               "height": 399
//           },
//           "selected": false,
//           "dragging": false
//       },
//       {
//           "id": "ae804166-7b0f-4c97-b96b-44df91a56298",
//           "type": "Library.playlistTracks",
//           "position": {
//               "x": 18,
//               "y": 46
//           },
//           "data": {
//               "playlistIds": [],
//               "playlists": [],
//               "playlistId": "37i9dQZF1E35j9i7QVX8Xe",
//               "name": "Daily Mix 1",
//               "description": "Dreane, .Feast, Efek Rumah Kaca and more",
//               "image": "https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebcb772c04cf4b9be21d6d7493/1/en/large",
//               "total": 50,
//               "owner": "Spotify"
//           },
//           "measured": {
//               "width": 350,
//               "height": 399
//           },
//           "selected": false,
//           "dragging": false
//       }
//   ],
//   "edges": [
//       {
//           "id": "7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41->ab849a87-5615-47db-8494-08c1a2691452",
//           "source": "7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41",
//           "target": "ab849a87-5615-47db-8494-08c1a2691452"
//       },
//       {
//           "id": "a722dab7-ab8e-44f2-b390-458f2bc5f49c->7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41",
//           "animated": true,
//           "source": "a722dab7-ab8e-44f2-b390-458f2bc5f49c",
//           "sourceHandle": null,
//           "target": "7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41",
//           "targetHandle": null
//       },
//       {
//           "id": "ae804166-7b0f-4c97-b96b-44df91a56298->7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41",
//           "animated": true,
//           "source": "ae804166-7b0f-4c97-b96b-44df91a56298",
//           "sourceHandle": null,
//           "target": "7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41",
//           "targetHandle": null
//       }
//   ]
// }

const defaultNodes: Node[] = [
  // {
  //   id: "hero",
  //   type: "hero",
  //   position: { x: 390, y: 50 },
  //   data: { ...initialState, label: "output" },
  //   className: "w-[200px] lg:w-[300px]",
  //   style: { opacity: 0 },
  // },
  // {
  //   id: "color",
  //   type: "colorpicker",
  //   position: { x: 50, y: 0 },
  //   data: { ...initialState, label: "shape color" },
  //   className: "w-[150px]",
  //   style: { opacity: 0 },
  // },
  // {
  //   id: "shape",
  //   type: "switcher",
  //   position: { x: 0, y: 125 },
  //   data: {
  //     ...initialState,
  //     label: "shape type",
  //   },
  //   className: "w-[150px]",
  //   style: { opacity: 0 },
  // },
  // {
  //   id: "zoom",
  //   type: "slider",z
  //   position: { x: 40, y: 280 },
  //   data: {
  //     ...initialState,
  //     label: "zoom level",
  //   },
  //   className: "w-[150px]",
  //   style: { opacity: 0 },
  // },
  {
    id: "ab849a87-5615-47db-8494-08c1a2691452",
    type: "Library.saveAsReplace",
    position: {
      x: 901,
      y: 325,
    },
    data: {
      id: "48oIVyOtTlttINc7rYq0PZ",
      playlistId: "48oIVyOtTlttINc7rYq0PZ",
      name: "Daily Mixes",
      description: "",
      image:
        "https://mosaic.scdn.co/640/ab67616d00001e02871062e86dc8a76683b66019ab67616d00001e029c93931e7cfa4d8216056795ab67616d00001e02b91b4ade012ef3a2448e3a96ab67616d00001e02ee0ec368f9b61f602365d864",
      total: 1057,
      owner: "null",
    },
    measured: {
      width: 350,
      height: 306,
    },
    selected: true,
  },
  {
    id: "7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41",
    type: "Combiner.alternate",
    position: {
      x: 451,
      y: 325,
    },
    data: {
      playlistIds: ["37i9dQZF1E38EJlcnVuskA", "37i9dQZF1E35j9i7QVX8Xe"],
      playlists: [
        {
          playlistId: "37i9dQZF1E38EJlcnVuskA",
          name: "Daily Mix 2",
          description: "Men I Trust, Jakob, Vansire and more",
          image:
            "https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebfd30ebd7e80dad6b2383aab0/2/en/large",
          owner: "Spotify",
          total: 50,
        },
        {
          playlistId: "37i9dQZF1E35j9i7QVX8Xe",
          name: "Daily Mix 1",
          description: "Dreane, .Feast, Efek Rumah Kaca and more",
          image:
            "https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebcb772c04cf4b9be21d6d7493/1/en/large",
          owner: "Spotify",
          total: 50,
        },
      ],
    },
    measured: {
      width: 350,
      height: 394,
    },
    selected: false,
    dragging: false,
  },
  {
    id: "a722dab7-ab8e-44f2-b390-458f2bc5f49c",
    type: "Library.playlistTracks",
    position: {
      x: 17,
      y: 443,
    },
    data: {
      playlistIds: [],
      playlists: [],
      playlistId: "37i9dQZF1E38EJlcnVuskA",
      name: "Daily Mix 2",
      description: "Men I Trust, Jakob, Vansire and more",
      image:
        "https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebfd30ebd7e80dad6b2383aab0/2/en/large",
      total: 50,
      owner: "Spotify",
    },
    measured: {
      width: 350,
      height: 399,
    },
    selected: false,
    dragging: false,
  },
  {
    id: "ae804166-7b0f-4c97-b96b-44df91a56298",
    type: "Library.playlistTracks",
    position: {
      x: 18,
      y: 46,
    },
    data: {
      playlistIds: [],
      playlists: [],
      playlistId: "37i9dQZF1E35j9i7QVX8Xe",
      name: "Daily Mix 1",
      description: "Dreane, .Feast, Efek Rumah Kaca and more",
      image:
        "https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebcb772c04cf4b9be21d6d7493/1/en/large",
      total: 50,
      owner: "Spotify",
    },
    measured: {
      width: 350,
      height: 399,
    },
    selected: false,
    dragging: false,
  },
];

const defaultEdges: Edge[] = [
  {
    id: "7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41->ab849a87-5615-47db-8494-08c1a2691452",
    source: "7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41",
    target: "ab849a87-5615-47db-8494-08c1a2691452",
    animated: true,
  },
  {
    id: "a722dab7-ab8e-44f2-b390-458f2bc5f49c->7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41",
    animated: true,
    source: "a722dab7-ab8e-44f2-b390-458f2bc5f49c",
    sourceHandle: null,
    target: "7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41",
    targetHandle: null,
  },
  {
    id: "ae804166-7b0f-4c97-b96b-44df91a56298->7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41",
    animated: true,
    source: "ae804166-7b0f-4c97-b96b-44df91a56298",
    sourceHandle: null,
    target: "7d2d1dcd-cfe1-4acd-b0a4-c8dcec7cfe41",
    targetHandle: null,
  },
];

type FlowProps = {
  initialColor?: string;
  className?: string;
};

const viewportWidthSelector = (state: ReactFlowState) => state.width;

function Flow({ initialColor = "#777", className }: FlowProps) {
  const { getNodes, setNodes, setEdges, setViewport } = useReactFlow();
  const viewportWidth = useStore(viewportWidthSelector);
  const store = useStoreApi();
  const [flowState, setFlowState] = useState({
    ...initialState,
    color: initialColor,
  });

  const adjustViewport = useCallback(() => {
    const nodes = getNodes();
    const { width, height } = store.getState();
    const {
      x: xMin,
      y: yMin,
      width: xMax,
      height: yMax,
    } = getNodesBounds(nodes);

    const zoom = width < 1240 ? (width < 500 ? 0.4 : 0.4) : 0.7;
    const mobileView = width < 1024;
    const flowWidth = (xMax - xMin) * zoom;
    const flowHeight = (yMax - yMin) * zoom;
    const navWidth = Math.min(width - 70, 1200);
    const viewportX = mobileView
      ? width / 2 - flowWidth / 2
      : width - flowWidth - (width - navWidth) / 2;
    const viewportY = mobileView
      ? height - flowHeight - 20
      : height / 2 - flowHeight / 2;

    setViewport({ x: viewportX, y: viewportY, zoom });
  }, [setViewport, getNodes, store]);

  const onInit = useCallback(() => {
    adjustViewport();
    setNodes((nds) =>
      nds.map((n) => ({ ...n, style: { ...n.style, opacity: 1 } })),
    );
    setEdges((eds) =>
      eds.map((e) => ({ ...e, style: { ...e.style, opacity: 1 } })),
    );
  }, [setViewport, getNodes, store]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, ...flowState, setState: setFlowState },
      })),
    );
  }, [flowState]);

  useEffect(() => {
    adjustViewport();
  }, [viewportWidth]);

  return (
    <div className="absolute top-0 right-0 left-0 z-[3] w-full h-full bg-gradient bg-no-repeat bg-[center_120px] lg:bg-[65%_center] lg:bg-[length:35%]">
      <ReactFlow
        preventScrolling={false}
        zoomOnScroll={false}
        nodeTypes={nodeTypes}
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        // proOptions={proOptions}
        panOnDrag={viewportWidth > 1024}
        className={className}
        onInit={onInit}
        id="hero"
      ></ReactFlow>
    </div>
  );
}

export default function Wrapper(props: FlowProps) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
