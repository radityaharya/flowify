import { zodResolver } from "@hookform/resolvers/zod";
import { useHandleConnections } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type ZodObject } from "zod";
import useStore from "~/app/states/store";

type Playlist = {
  playlistId?: string;
  name?: string;
  description?: string;
  image?: string;
  owner?: string;
  total?: number;
};

const usePlaylistLogic = (id: string, formSchema?: ZodObject<any>) => {
  const { nodes, updateNodeData } = useStore((state) => ({
    nodes: state.nodes,
    updateNodeData: state.updateNodeData,
  }));

  const [state, setState] = useState({
    playlists: [] as Playlist[],
    playlistIds: [] as string[],
    invalidNodesCount: 0,
    summary: {
      total: 0,
    },
  });

  const form = useForm({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    shouldUnregister: false,
    mode: "all",
  });

  const { formState, register } = form ?? {};

  const getNodeData = useCallback(
    (id: string) => nodes.find((node) => node.id === id)?.data,
    [nodes],
  );

  const targetConnections = useHandleConnections({
    type: "target",
    nodeId: id,
  });

  const sourceConnections = useHandleConnections({
    type: "source",
    nodeId: id,
  });

  useEffect(() => {
    let invalidNodesCount = 0;
    const playlistIdsSet = new Set<string>();
    const playlistsSet = new Set<Playlist>();

    if (!targetConnections?.length) {
      setState({
        playlistIds: [],
        playlists: [],
        invalidNodesCount: 0,
        summary: {
          total: 0,
        },
      });
      return;
    }

    targetConnections.forEach((connection) => {
      const target = getNodeData(connection.source);
      if (!target) return;

      const {
        playlistId,
        playlistIds = [],
        total,
        name,
        description,
        image,
        owner,
        playlists = [],
      } = target as any;

      const hasPlaylistId = Boolean(playlistId);
      const hasPlaylistIds = Boolean(playlistIds && playlistIds.length > 0);

      if (!(hasPlaylistId || hasPlaylistIds)) {
        invalidNodesCount++;
      }

      const playlist: Playlist = {
        playlistId: playlistId as string,
        name: name as string,
        description: description as string,
        image: image as string,
        owner: owner as string,
        total: total as number,
      };
      playlistsSet.add(playlist);
      playlistIdsSet.add(playlistId as string);

      (playlistIds || []).forEach((id) => playlistIdsSet.add(id as string));
      (playlists || []).forEach((pl) => playlistsSet.add(pl as Playlist));
    });

    const combinedPlaylistIds = Array.from(playlistIdsSet).filter(Boolean);
    const combinedPlaylists = Array.from(playlistsSet)
      .filter(Boolean)
      .filter((playlist) => Object.keys(playlist).length !== 0)
      .filter((playlist) => playlist.playlistId);

    setState({
      playlistIds: combinedPlaylistIds,
      playlists: combinedPlaylists,
      invalidNodesCount,
      summary: {
        total: combinedPlaylists.reduce(
          (acc, curr) => acc + (curr.total ?? 0),
          0,
        ),
      },
    });
  }, [targetConnections, getNodeData]);

  useEffect(() => {
    const currentNodeData = getNodeData(id);
    if (
      JSON.stringify(currentNodeData?.playlistIds) !==
      JSON.stringify(state.playlistIds)
    ) {
      updateNodeData(id, {
        playlistIds: state.playlistIds,
        playlists: state.playlists,
      });
    }
  }, [id, getNodeData, updateNodeData, state.playlistIds, state.playlists]);

  return {
    state,
    isValid:
      state.invalidNodesCount === 0 &&
      targetConnections.length > 0 &&
      state.playlists.length > 0,
    targetConnections,
    sourceConnections,
    nodeData: getNodeData(id),
    getNodeData,
    updateNodeData,
    ...(formSchema
      ? {
          form,
          formState,
          register,
        }
      : {}),
  };
};

export default usePlaylistLogic;
