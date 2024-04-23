import useStore from "@/app/states/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GripVertical, InfoIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

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
        <div className="group h-min-content w-full">
          <div
            className="flex w-full flex-row items-center justify-between gap-2 rounded-md p-2 dark:bg-accent"
            onDragStart={onDragStart}
            onClick={onClick}
            onKeyDown={onClick}
            draggable
          >
            <div className="flex flex-row gap-2">
              {/* <span className="text-sm font-medium">{type} :</span> */}
              <span className="flex flex-row gap-2 font-medium text-sm">
                <TooltipTrigger className="hidden w-0 group-hover:block group-hover:w-min">
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
