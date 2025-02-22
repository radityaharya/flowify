import { GripVertical } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import useStore from "@/app/states/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const { nodes, addNode, addEdge } = useStore(
    useShallow((state: any) => ({
      nodes: state.nodes,
      addNode: state.addNode,
      addEdge: state.addEdge,
    })),
  );

  const onClick = (event) => {
    event.preventDefault();

    const newNodePosition =
      nodes.length > 0
        ? { x: nodes[0]!.position.x + 450, y: nodes[0]!.position.y }
        : { x: 100, y: 100 };

    const newNode = addNode({
      type: nodeType,
      position: newNodePosition,
      data: {},
    });

    if (nodes.length > 0) {
      addEdge({
        source: nodes[0]!.id,
        target: newNode.id,
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <div className="h-min-content group w-full">
          <div
            className="flex w-full flex-row items-start justify-between gap-2 rounded-md p-2 text-start dark:bg-accent"
            onDragStart={onDragStart}
            onClick={onClick}
            onKeyDown={onClick}
            draggable
          >
            <div className="flex flex-row gap-2">
              <TooltipTrigger className="flex flex-row gap-2 text-start text-sm font-medium">
                {title}
              </TooltipTrigger>
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
