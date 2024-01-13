import { AlertComponent } from "./Alert";
import Image from "next/image";

export function SourceList({
  state,
  isValid,
  operationType,
}: {
  state: any;
  isValid: boolean;
  operationType: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col text-sm font-medium">
        {state.playlistIds.length === 0 ? (
          <AlertComponent
            variant="destructive"
            title="Error"
            description="No playlist component set as input"
          />
        ) : isValid ? (
          <div className="flex flex-col">
            <span>{operationType} {state.playlistIds.length} playlists</span>
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
                    <div className="text-sm font-medium">{playlist.name}</div>
                    <div className="text-xs text-gray-400">
                      {playlist.owner} - {playlist.total} tracks
                    </div>
                  </div>
                </div>
              ) : null,
            )
          : "No playlists found"}
      </div>
    </div>
  );
}
