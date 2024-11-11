import React from "react";
import { z } from "zod";

import useStore from "~/app/states/store";
import useBasicNodeState from "~/hooks/useBasicNodeState";

const formSchema = z.object({
  playlistId: z.string().min(1, {
    message: "Playlist is required.",
  }),
  limit: z.number().optional(),
  offset: z.number().optional(),
  description: z.string().optional(),
});

export const usePlaylistState = (id: string, data: Workflow.Playlist) => {
  const [open, setOpen] = React.useState(false);
  const [selectedPlaylist, setSelectedPlaylist] =
    React.useState<Workflow.Playlist>(data);
  const [search, setSearch] = React.useState("");

  const {
    state,
    isValid,
    targetConnections,
    sourceConnections,
    form,
    formState,
    register,
    getNodeData,
    updateNodeData,
  } = useBasicNodeState(id, formSchema);

  const { session, userPlaylists, setUserPlaylistsStore } = useStore(
    (state) => ({
      session: state.session,
      userPlaylists: state.userPlaylists,
      setUserPlaylistsStore: state.setUserPlaylists,
    }),
  );

  React.useEffect(() => {
    if (data) {
      form?.setValue("playlistId", data.playlistId);
      updateNodeData(id, data);
      form?.trigger("playlistId");
    }
  }, [data, form, id, updateNodeData]);

  const watch = form!.watch();
  const prevWatchRef = React.useRef(watch);
  const prevSelectedPlaylistRef = React.useRef(selectedPlaylist);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (
      JSON.stringify(prevWatchRef.current) !== JSON.stringify(watch) ||
      JSON.stringify(prevSelectedPlaylistRef.current) !==
        JSON.stringify(selectedPlaylist)
    ) {
      updateNodeData(id, {
        ...watch,
        ...selectedPlaylist,
      });
    }
    prevWatchRef.current = watch;
    prevSelectedPlaylistRef.current = selectedPlaylist;
  }, [watch, selectedPlaylist, data, id, updateNodeData]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    const searchPlaylist = async () => {
      if (session?.user) {
        if (search.length > 0) {
          try {
            const response = await fetch(
              `/api/user/${session.user.providerAccountId}/playlists?q=${search}`,
            );
            const data = await response.json();
            const newPlaylists = userPlaylists.concat(data);
            const dedupedPlaylists = newPlaylists.reduce((acc, current) => {
              const x = acc.find(
                (item) => item.playlistId === current.playlistId,
              );
              if (!x) {
                return acc.concat([current]);
              } else {
                return acc;
              }
            }, []);

            setUserPlaylistsStore(dedupedPlaylists);
          } catch (err) {
            console.error(err);
          }
        }
      }
    };

    const userPlaylistsFetch = async () => {
      if (session?.user) {
        try {
          const response = await fetch(
            `/api/user/${session.user.providerAccountId}/playlists`,
          );
          const data = await response.json();
          setUserPlaylistsStore(data as any[]);
        } catch (err) {
          console.error(err);
        }
      }
    };

    function setUserPlaylists() {
      if (session?.user) {
        if (search.length > 0) {
          searchPlaylist().catch((err) => {
            console.error(err);
          });
        } else {
          userPlaylistsFetch().catch((err) => {
            console.error(err);
          });
        }
      }
    }

    // debounce({delay: 500}, setUserPlaylists)();
    setUserPlaylists();
  }, [search, session, setUserPlaylistsStore]);

  const handleSelect = (playlist) => {
    console.info("handle select", playlist);
    form?.setValue("playlistId", playlist.playlistId, {
      shouldValidate: true,
    });
    console.info("data after update", getNodeData(id));
    setSelectedPlaylist(playlist as Workflow.Playlist);
    setOpen(false);
  };

  return {
    open,
    setOpen,
    selectedPlaylist,
    setSelectedPlaylist,
    search,
    setSearch,
    state,
    isValid,
    targetConnections,
    sourceConnections,
    form,
    formState,
    register,
    getNodeData,
    updateNodeData,
    session,
    userPlaylists,
    setUserPlaylistsStore,
    handleSelect,
  };
};
