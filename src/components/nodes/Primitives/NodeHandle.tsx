import { Handle, getConnectedEdges, useNodeId } from "@xyflow/react";
import { useMemo } from "react";
import useStore from "~/app/states/store";

const NodeHandle = (props) => {
  const { getNode, edges, nodes } = useStore((state) => ({
    getNode: state.getNode,
    edges: state.edges,
    nodes: state.nodes,
  }));

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

      const connectable = connectedEdges.length < props.isConnectable;

      return connectable;
    }

    return props.isConnectable;
  }, [getNode, edges, nodeId, props.isConnectable]);

  return (
    <Handle
      {...props}
      style={{ background: "#555", width: "20px", height: "20px" }}
      isConnectable={isHandleConnectable}
    ></Handle>
  );
};

export default NodeHandle;
