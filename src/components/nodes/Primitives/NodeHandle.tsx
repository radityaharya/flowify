import { useMemo } from 'react';
import { getConnectedEdges, Handle, useNodeId, getOutgoers, getIncomers } from "@xyflow/react";
import useStore from "~/app/states/store";
import { toast } from 'sonner';


const NodeHandle = (props) => {
    const { getNode, edges, nodes } = useStore((state) => ({
      getNode: state.getNode,
      edges: state.edges,
      nodes: state.nodes,
    }));

    const nodeId = useNodeId();
    // const node = nodes.find((node) => node.id === nodeId);

    // const outgoers = getOutgoers(node!, nodes, edges)
    // const incomers = getOutgoers(node!, nodes, edges)

    const isHandleConnectable = useMemo(() => {
        if (typeof props.isConnectable === 'function') {
            const node = getNode(nodeId!);
            const connectedEdges = getConnectedEdges([node!], edges);
            
            return props.isConnectable({ node, connectedEdges });
        }

        if (typeof props.isConnectable === 'number') {
            const node = getNode(nodeId!);
            const connectedEdges = getConnectedEdges([node!], edges);

            const connectable =  connectedEdges.length < props.isConnectable;

            // if (!connectable && ( props.type === "source" && outgoers.length >= props.isConnectable || props.type === "target" && incomers.length >= props.isConnectable)) {
            //   toast.error(props.type === "source" ? `You can only connect ${props.isConnectable} sources` : `You can only connect ${props.isConnectable} targets`);
            // }

            return connectable;
        }


        return props.isConnectable;
    }, [getNode, edges, nodeId, props.isConnectable, props.type]);

    return (
        <Handle {...props} style={{ background: "#555", width:"20px", height:"20px" }} isConnectable={isHandleConnectable}></Handle>
    );
};

export default NodeHandle;
