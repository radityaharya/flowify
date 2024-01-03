/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { memo } from "react";
import { Handle, Position } from "reactflow";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default memo(
  ({ data, isConnectable }: { data: any; isConnectable: boolean }) => {
    return (
      <Card className="w-[250px]">
        {/* <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      /> */}
        <CardHeader>
          <CardTitle>Source</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardHeader>
        {/* <input
          className="nodrag"
          type="color"
          onChange={data.onChange}
          defaultValue={data.color}
        /> */}
        {/* <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ top: 10, background: '#555' }}
        isConnectable={isConnectable}
      /> */}
        <Handle
          type="source"
          position={Position.Top}
          id="b"
          // style={{ bottom: 10, top: "auto", background: "#555" }}
          isConnectable={isConnectable}
        />
      </Card>
    );
  },
);
