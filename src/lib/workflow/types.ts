interface Source {
  id: string;
  type: string;
  params: any;
  tracks?: SpotifyApi.PlaylistTrackObject[];
}

interface Operation {
  id: string;
  type:
    | "Filter.filter"
    | "Filter.dedupeTracks"
    | "Filter.dedupeArtists"
    | "Filter.match"
    | "Filter.limit"
    | "Combiner.push"
    | "Combiner.alternate"
    | "Utility.save"
    | "Utility.removeKeys"
    | "Utility.includeOnlyKeys"
    | "Utility.summary"
    | "Order.sort"
    | "Order.shuffle"
    | "Playlist.saveAsNew"
    | "Playlist.saveAsAppend"
    | "Playlist.saveAsReplace";
  params: Record<string, any>;
  sources: string[];
  tracks?: SpotifyApi.PlaylistTrackObject[];
}
interface Workflow {
  name: string;
  sources: Source[];
  operations: Operation[];
}

export type{
  Source,
  Operation,
  Workflow
}