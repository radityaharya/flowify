import { PlaylistItem as PlaylistItemPrimitive } from "../Primitives/PlaylistItem";
import { AlertComponent } from "./Alert";

interface SourceListProps {
  state: any;
  isValid: boolean;
  operationType: string;
}

export function SourceList({ state, isValid, operationType }: SourceListProps) {
  if (!(state?.playlistIds && state.playlists)) {
    return (
      <AlertComponent
        variant="destructive"
        title="Error"
        description="No track source set as input"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col text-sm font-medium">
        {state.playlistIds.length === 0 ? (
          <AlertComponent
            variant="destructive"
            title="Error"
            description="No track source set as input"
          />
        ) : isValid ? (
          <div className="flex flex-col">
            <span>
              {operationType} {state.playlistIds.length} playlists
            </span>
            <span className="text-xs font-normal opacity-80">
              Total of {state.summary.total} tracks
            </span>
          </div>
        ) : (
          <AlertComponent
            variant="destructive"
            title="Error"
            description={`${state.invalidNodesCount} nodes connected do not have a track source`}
          />
        )}
      </div>
      <div className="flex flex-col gap-2">
        {state.playlists.length > 0
          ? state.playlists.map((playlist) =>
              playlist && isValid ? (
                <PlaylistItemPrimitive
                  key={playlist.id || playlist.name}
                  playlist={playlist}
                />
              ) : null,
            )
          : "No playlists found"}
      </div>
    </div>
  );
}
