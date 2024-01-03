/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react';
import Draggable from 'react-draggable';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export const DragableNode = ({ nodeType }) => {
  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card
        draggable
        onDragStart={onDragStart}
        // style={{ width: '200px', height: '200px', backgroundColor: 'lightblue' }}
        className="w-full h-min-content"
      >
        <CardHeader>
          <CardTitle>Source</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardHeader>
      </Card>
  );
};

export default DragableNode;
