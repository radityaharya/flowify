/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from "react";
import Draggable from "react-draggable";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GripVertical, InfoIcon } from "lucide-react";

type DragableNodeProps = {
  nodeType: string;
  title: string;
  description: string;
  type: string;
};
export const DragableNode = ({
  nodeType,
  title,
  description,
  type,
}: DragableNodeProps) => {
  const onDragStart = (event) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <div className="h-min-content w-full">
          <div
            className="flex w-full flex-row items-center justify-between gap-2 rounded-md p-2 dark:bg-accent"
            onDragStart={onDragStart}
            draggable
          >
            <div className="flex flex-row gap-2">
              {/* <span className="text-sm font-medium">{type} :</span> */}
              <span className="text-sm font-normal flex flex-row gap-2">
                <TooltipTrigger>
                  <InfoIcon size={12} />
                </TooltipTrigger>
                {title}
              </span>
            </div>
            <GripVertical size={16} className="cursor-grab" />
          </div>
        </div>
        <TooltipContent>{description}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DragableNode;
