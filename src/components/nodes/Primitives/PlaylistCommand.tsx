import { CommandItem } from "@/components/ui/command";
import React from "react";
import { PlaylistItem as PlaylistItemPrimitive } from "../Primitives/PlaylistItem";
type PlaylistCommandProps = {
  playlist: Workflow.Playlist;
  onSelect: () => void;
};

const PlaylistCommand: React.FC<PlaylistCommandProps> = ({
  playlist,
  onSelect,
}) => (
  <CommandItem
    key={playlist.playlistId}
    value={`${playlist.name} - ${playlist.playlistId}`}
    onSelect={onSelect}
  >
    <PlaylistItemPrimitive playlist={playlist} />
  </CommandItem>
);

export default PlaylistCommand;
