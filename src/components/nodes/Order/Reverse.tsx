import React from "react";
import NodeBuilder from "../Primitives/NodeBuilder";

const Reverse: React.FC = ({ id, data }: any) => {

  return (
    <NodeBuilder
      id={id}
      data={data}
      title="Reverse"
      type="Order"
      info="Reverses the order of tracks"
      handleConnectionType="both"
    />
  );
};

export default Reverse;
