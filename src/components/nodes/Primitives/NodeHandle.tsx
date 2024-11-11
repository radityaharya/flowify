import { getConnectedEdges, Handle, useNodeId } from "@xyflow/react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import useStore from "~/app/states/store";

const NodeHandle = (props) => {
  const { getNode, edges } = useStore(useShallow((state) => state));

  const nodeId = useNodeId();

  const isHandleConnectable = useMemo(() => {
    if (typeof props.isConnectable === "function") {
      const node = getNode(nodeId!);
      const connectedEdges = getConnectedEdges([node!], edges);

      return props.isConnectable({ node, connectedEdges });
    }

    if (typeof props.isConnectable === "number") {
      const node = getNode(nodeId!);
      const connectedEdges = getConnectedEdges([node!], edges);

      return connectedEdges.length < props.isConnectable;
    }

    return props.isConnectable;
  }, [getNode, edges, nodeId, props.isConnectable]);

  return (
    <Handle
      {...props}
      className="size-5 bg-gray-700"
      isConnectable={isHandleConnectable}
    />
  );
};

export default NodeHandle;
