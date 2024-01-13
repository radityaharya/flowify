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

import Image from "next/image";

import { Separator } from "~/components/ui/separator";

import { CardWithHeader } from "../Primitives/Card";
import Debug from "../Primitives/Debug";
import useBasicNodeState from "~/hooks/useBasicNodeState";
import { AlertComponent } from "../Primitives/Alert";

type PlaylistProps = {
  id: string;
  data: any;
};

type Playlist = {
  playlistId?: string;
  name?: string;
  description?: string;
  image?: string;
  owner?: string;
  total?: number;
};

const DedupeArtistsComponent: React.FC<PlaylistProps> = React.memo(
  ({ id, data }) => {
    const { state, isValid, targetConnections, sourceConnections } =
      useBasicNodeState(id);

    return (
      <CardWithHeader
        title="Dedupe Artists"
        type="Filter"
        status={isValid === null ? "loading" : isValid ? "success" : "error"}
        info="Remove duplicate artists from multiple playlists"
      >
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: "#fff",
            padding: "0.2rem",
            borderRadius: "0.5px",
            border: "1px solid #555",
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: "#fff",
            padding: "0.2rem",
            borderRadius: "0.5px",
            border: "1px solid #555",
          }}
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
                <span>Combining {targetConnections?.length} playlists</span>
                <span className="text-xs font-normal opacity-80">
                  Total of {state.summary.total} artists
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
                          {playlist.owner} - {playlist.total} artists
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

export default DedupeArtistsComponent;
