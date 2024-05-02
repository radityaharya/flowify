import React from "react";
import NodeBuilder from "../Primitives/NodeBuilder";

const Reverse: React.FC = ({ id, data }: any) => {
  return (
    <NodeBuilder
      id={id}
      data={data}
      title="Separate Artists"
      type="Order"
      info="minimizes the number of adjacent songs by the same artist"
      handleConnectionType="both"
    />
  );
};

export default Reverse;
