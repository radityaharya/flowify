export type WorkflowResponseItem = {
  id: string;
  cron: string | null;
  workflow: {
    id: string;
    name: string;
    description: string;
    sources: {
      id: string;
      type: string;
      params: {
        playlistIds: string[];
        playlists: any[];
        playlistId: string;
        name: string;
        description: string;
        image: string;
        total: number;
        owner: string;
      };
      rfstate: {
        position: {
          x: number;
          y: number;
        };
        data: {
          playlistIds: string[];
          playlists: any[];
          playlistId: string;
          name: string;
          description: string;
          image: string;
          total: number;
          owner: string;
        };
      };
    }[];
    operations: {
      id: string;
      type: string;
      params: any;
      position: {
        x: number;
        y: number;
      };
      sources: string[];
      rfstate: {
        position: {
          x: number;
          y: number;
        };
        data: any;
      };
    }[];
    connections: {
      id: string;
      source: string;
      target: string;
    }[];
  };
  createdAt: number;
  lastRunAt?: number;
  modifiedAt?: number;
};

export namespace API {
  export type WorkflowResponse = WorkflowResponseItem;
  export type WorkflowsResponse = WorkflowResponseItem[];
}
