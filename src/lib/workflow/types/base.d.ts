type Operations = {
  Filter: typeof Filter;
  Combiner: typeof Combiner;
  Utility: typeof Utility;
  Order: typeof Order;
  Playlist: typeof Playlist;
  Library: typeof Library;
};

type OperationArgs = {
  spClient: SpotifyWebApi;
  sources: any[];
  params: any;
};

export namespace Workflow {
  export type OperationArgs = OperationArgs;
  export type Operations = Operations;
}
