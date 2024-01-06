import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getToken } from "next-auth/jwt";

import { type Edge, type Node, type Position } from "@xyflow/react";

// const secret = process.env.NEXTAUTH_SECRET;

export async function GET(request: NextRequest) {
  // const session = await getServerSession({ req: request, ...authOptions });
  // const token = await getToken({ req: request, secret });

  // if (session && token) {
  //   return NextResponse.next();
  // } else {
  //   return NextResponse.redirect("/api/auth/signin");
  // }

  const nodeSize = {
    width: 100,
    height: 40,
  };

  // this example uses some v12 features that are not released yet
  const initialNodes: Node[] = [
    {
      id: "1",
      type: "input",
      data: { label: "Node 1" },
      position: { x: 250, y: 5 },
      width: 100,
      height: 40,
      // @ts-expect-error v12 feature
      handles: [
        {
          type: "source",
          position: "bottom" as Position,
          x: nodeSize.width * 0.5,
          y: nodeSize.height,
          width: 1,
          height: 1,
        },
      ],
    },
    {
      id: "2",
      data: { label: "Node 2" },
      position: { x: 100, y: 100 },
      width: 100,
      height: 40,
      // handles: [
      //   {
      //     type: 'source',
      //     position: 'bottom' as Position,
      //     x: nodeSize.width * 0.5,
      //     y: nodeSize.height,
      //     width: 1,
      //     height: 1,
      //   },
      //   {
      //     type: 'target',
      //     position: 'top' as Position,
      //     x: nodeSize.width * 0.5,
      //     y: 0,
      //     width: 1,
      //     height: 1,
      //   },
      // ],
    },
    {
      id: "3",
      data: { label: "Node 3" },
      position: { x: 400, y: 100 },
      width: 100,
      height: 40,
      // handles: [
      //   {
      //     type: 'source',
      //     position: 'bottom' as Position,
      //     x: nodeSize.width * 0.5,
      //     y: nodeSize.height,
      //     width: 1,
      //     height: 1,
      //   },
      //   {
      //     type: 'target',
      //     position: 'top' as Position,
      //     x: nodeSize.width * 0.5,
      //     y: 0,
      //     width: 1,
      //     height: 1,
      //   },
      // ],
    },
  ];

  const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true },
    { id: "e1-3", source: "1", target: "3", animated: true },
  ];

  const data = {
    nodes: initialNodes,
    edges: initialEdges,
  };

  return NextResponse.json(data);
}
