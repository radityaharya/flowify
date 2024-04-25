/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { DragableNode } from "@/components/DragableNode";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCallback, useMemo } from "react";
import React from "react";
import { Nodes } from "./Flow";

type NodeType = {
  title: string;
  description: string;
  nodeType: string;
};

type NodesByType = {
  [type: string]: NodeType[];
};

function Sidebar() {
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((_event) => {
    return;
  }, []);

  const nodesByType: NodesByType = useMemo(() => {
    return Object.entries(Nodes).reduce((groups, [nodeType, nodeInfo]) => {
      const type = nodeType.split(".")[0];
      if (type) {
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type]?.push({
          nodeType,
          title: nodeInfo.title,
          description: nodeInfo.description,
        });
      }
      return groups;
    }, {} as NodesByType);
  }, []);

  return (
    <aside
      className="col-span-1 flex h-full max-h-screen select-none flex-col justify-between border-r"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex flex-col gap-6">
        <div className="flex-none px-6 pt-[4rem]">
          <div className="flex flex-col justify-between gap-6">
            <div className="flex flex-row justify-between"></div>
          </div>
        </div>
        <div className="flex flex-col gap-1 px-6">
          <h2 className="font-bold tracking-wider">Workflow Builder</h2>
          <p className="flex flex-row gap-1 font-normal text-xs opacity-80">
            Drag and drop nodes to the canvas to create a workflow
          </p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="px-6"
          defaultValue="item-1"
        >
          <AccordionItems nodesByType={nodesByType} />
        </Accordion>
      </div>
    </aside>
  );
}

function AccordionItems({ nodesByType }: { nodesByType: NodesByType }) {
  return (
    <>
      {Object.entries(nodesByType).map(
        ([type, nodes]: [string, NodeType[]], index) => (
          <AccordionItem value={`item-${index + 1}`} key={type}>
            <AccordionTrigger>{type}</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              {nodes.map(({ title, description, nodeType }) => (
                <DragableNode
                  key={nodeType}
                  nodeType={nodeType}
                  title={title}
                  description={description}
                  type={type}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        ),
      )}
    </>
  );
}

export default React.memo(Sidebar);
