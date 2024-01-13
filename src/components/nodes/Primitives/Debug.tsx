import { ScrollArea } from "~/components/ui/scroll-area";
import { memo, useMemo } from "react";
import useStore from "~/app/states/store";
import { useShallow } from "zustand/react/shallow";
import React from "react";

const DebugInfo = ({ id, isValid, TargetConnections, SourceConnections }: {
  id: string;
  isValid: boolean;
  TargetConnections: any;
  SourceConnections: any;
}) => {
  const { nodes } = useStore(useShallow((state) => ({ nodes: state.nodes })));
  const getNodeData = useMemo(
    () => (id: string) => nodes.find((node) => node.id === id)?.data,
    [nodes],
    );

  return (
  <div className="whitespace-pre-wrap rounded-md bg-red-500 p-2 py-2">
    <pre className="whitespace-pre-wrap text-sm font-bold">Debug info</pre>
    <pre>
      <pre className="text-xs">id: {id}</pre>
      <pre className="text-xs">isValid: {isValid?.toString()}</pre>
      <pre className="text-xs whitespace-pre-wrap break-all">data: {JSON.stringify(getNodeData(id), null, 2)}</pre>
    </pre>
    <ScrollArea className="nodrag flex max-h-[200px] flex-col gap-2 overflow-auto overflow-x-hidden py-2">
      <pre className="text-xs">TargetConnections:</pre>
      {TargetConnections?.map((connection) => (
        <pre key={connection.source} className="py-1 text-xs">
          <pre>source: {connection.source}</pre>
          <pre className="whitespace-pre-wrap break-all">
          {JSON.stringify(getNodeData(connection.target as string), null, 2)}
          </pre>
        </pre>
      ))}
      <pre className="text-xs">SourceConnections:</pre>
      {SourceConnections?.map((connection) => (
        <pre key={connection.source} className="py-1 text-xs">
          <pre>source: {connection.source}</pre>
          <pre className="whitespace-pre-wrap break-all">
            {JSON.stringify(getNodeData(connection.source as string), null, 2)}
          </pre>
        </pre>
      ))}
    </ScrollArea>
  </div>
  );
}

export default React.memo(DebugInfo);