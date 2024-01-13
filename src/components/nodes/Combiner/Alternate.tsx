/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {  } from "react";
import {
  Handle,
  Position,
} from "@xyflow/react";

import {
  CardFooter,
} from "@/components/ui/card";

import { AlertCircle } from "lucide-react";
import { Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


import Image from "next/image";


import { Separator } from "~/components/ui/separator";

import { CardWithHeader } from "../Primitives/Card";

import useBasicNodeState from "~/hooks/useBasicNodeState";
import Debug from "../Primitives/Debug";

type PlaylistProps = {
  id: string;
  data: any;
};

export function AlertComponent({
  variant,
  title,
  description,
}: {
  variant: "default" | "destructive";
  title: string;
  description: string;
}) {
  return (
    <Alert variant={variant}>
      {variant === "default" ? (
        <Info className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="font-normal">{description}</AlertDescription>
    </Alert>
  );
}

const AlternateComponent: React.FC<PlaylistProps> = React.memo(
  ({ id, data }) => {
    const { state, isValid, targetConnections, sourceConnections } =
      useBasicNodeState(id);

    return (
      <CardWithHeader
        title={`Alternate`}
        type="Combiner"
        status={isValid === null ? "loading" : isValid ? "success" : "error"}
        info="Interleaves the tracks from multiple playlists"
      >
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: "#555" }}
        />
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: "#555" }}
        />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col text-sm font-medium">
            {targetConnections?.length === 0 ? (
              <AlertComponent
                variant="destructive"
                title="Error"
                description="No playlist component set as input"
              />
            ) : isValid ? (
              <div className="flex flex-col">
                <span>Combining {state.playlistIds.length} playlists</span>
                <span className="text-xs font-normal opacity-80">
                  Total of {state.summary.total} tracks
                </span>
              </div>
            ) : (
              <AlertComponent
                variant="destructive"
                title="Error"
                description={`${state.invalidNodesCount} nodes do not have a playlist component connected`}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            {state.playlists
              ? state.playlists?.map((playlist) =>
                  playlist && isValid ? (
                    <div className="flex items-center gap-2">
                      <Image
                        className="h-8 w-8 rounded-sm"
                        src={playlist.image ?? "/images/spotify.png"}
                        alt=""
                        width={32}
                        height={32}
                        unoptimized
                      />
                      <div className="flex flex-col">
                        <div className="text-sm font-medium">
                          {playlist.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {playlist.owner} - {playlist.total} tracks
                        </div>
                      </div>
                    </div>
                  ) : null,
                )
              : "No playlists found"}
          </div>
          <Separator />
          <Debug
            id={id}
            isValid={isValid}
            TargetConnections={targetConnections}
            SourceConnections={sourceConnections}
          />
        </div>
        <CardFooter></CardFooter>
      </CardWithHeader>
    );
  },
);

export default AlternateComponent;
