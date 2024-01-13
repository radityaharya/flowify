/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData,
} from "@xyflow/react";
import React from "react";

import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ScrollArea } from "@/components/ui/scroll-area";

import Image from "next/image";
import useStore from "~/app/states/store";
import { Separator } from "~/components/ui/separator";

import { CardWithHeader } from "../Primitives/Card";
import InputPrimitive from "../Primitives/Input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useShallow } from "zustand/react/shallow";
import Debug from "../Primitives/Debug";

type PlaylistProps = {
  id: string;
  data: any;
};

type Playlist = {
  playlistId?: string;
  name?: string;
  description?: string;
  image?: string;
  total?: number;
  owner?: string;
};

const formSchema = z.object({
  playlistId: z.string().min(1, {
    message: "Playlist is required.",
  }),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

const PlaylistItem = ({
  playlist,
  onSelect,
}: {
  playlist: Playlist;
  onSelect: () => void;
}) => (
  <CommandItem
    key={playlist.playlistId}
    value={playlist.playlistId}
    onSelect={onSelect}
  >
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
        <span className="text-sm font-medium">{playlist.name}</span>
        <span className="text-xs text-gray-400">
          {playlist.owner} - {playlist.total} tracks
        </span>
      </div>
    </div>
  </CommandItem>
);

function PlaylistComponent({ id, data }: PlaylistProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = React.useState<Playlist>({});
  const [search, setSearch] = React.useState("");

  const { session, updateNodeData, userPlaylists, nodes } = useStore(
    (state) => ({
      session: state.session,
      updateNodeData: state.updateNodeData,
      userPlaylists: state.userPlaylists,
      nodes: state.nodes,
    }),
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "all",
    shouldUnregister: false,
  });
  const { formState, register } = form;

  const TargetConnections = useHandleConnections({
    type: "target",
  });
  const SourceConnections = useHandleConnections({
    type: "source",
  });

  const watch = form.watch();
  const prevWatchRef = React.useRef(watch);
  const prevSelectedPlaylistRef = React.useRef(selectedPlaylist);

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
  }, [watch, selectedPlaylist]);

  React.useEffect(() => {
    const searchPlaylist = async () => {
      if (search.length > 0) {
        try {
          const response = await fetch(
            `/api/user/${session.user.providerAccountId}/playlists?q=${search}`,
          );
          const data = await response.json();
          console.log(data);
          useStore.setState({ userPlaylists: data });
        } catch (err) {
          console.error(err);
        }
      }
    };

    const userPlaylists = async () => {
      try {
        const response = await fetch(
          `/api/user/${session.user.providerAccountId}/playlists`,
        );
        const data = await response.json();
        console.log(data);
        useStore.setState({ userPlaylists: data });
      } catch (err) {
        console.error(err);
      }
    };

    function setUserPlaylists() {
      if (search.length > 0) {
        searchPlaylist().catch((err) => {
          console.error(err);
        });
      } else {
        userPlaylists().catch((err) => {
          console.error(err);
        });
      }
    }

    // debounce({delay: 500}, setUserPlaylists)();
    setUserPlaylists();
  }, [search]);

  function getNodeData(id: string) {
    const node = nodes.find((node) => node.id === id);
    return node?.data;
  }

  const handleSelect = (playlist) => {
    console.log("handle select", playlist);
    form.setValue("playlistId", playlist.playlistId, {
      shouldValidate: true,
    });
    console.log("data after update", getNodeData(id));
    setSelectedPlaylist(playlist as Playlist);
    setOpen(false);
  };

  return (
    <CardWithHeader
      title={`Playlist`}
      type="Source"
      status={formState.isValid ? "success" : "error"}
      info="Get a list of the songs in a playlist."
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => console.log(data))}>
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="playlistId"
              render={({ field, formState }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Playlist</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="h-[min-content] w-full justify-between"
                      >
                        {selectedPlaylist.image ? (
                          <div className="flex max-w-full items-center gap-4">
                            <Image
                              className="h-10 w-10 rounded-sm"
                              src={selectedPlaylist.image}
                              alt=""
                              width={40}
                              height={40}
                              unoptimized
                            />
                            <div className="flex w-[160px] flex-col items-start">
                              <div className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-sm font-medium">
                                {selectedPlaylist.name}
                              </div>
                              <div className="text-xs opacity-80">
                                {selectedPlaylist.owner} -{" "}
                                {selectedPlaylist.total} tracks
                              </div>
                            </div>
                          </div>
                        ) : (
                          "Select playlist..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search playlist..."
                          value={search}
                          onValueChange={(e) => setSearch(e)}
                        />
                        <CommandEmpty>No playlist found.</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className="h-[200px] w-full rounded-md">
                            {userPlaylists.length > 0
                              ? userPlaylists.map((playlist) => (
                                  <PlaylistItem
                                    key={playlist.playlistId}
                                    playlist={playlist}
                                    onSelect={() => handleSelect(playlist)}
                                  />
                                ))
                              : Array.from({ length: 3 }).map((_, index) => (
                                  <CommandItem
                                    key={`loading-${index}`}
                                    value="loading"
                                    onSelect={() => {
                                      setSelectedPlaylist({
                                        playlistId: "loading",
                                        name: "loading",
                                        description: "loading",
                                        image: "",
                                        owner: "loading",
                                        total: 0,
                                      });
                                      setOpen(false);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 animate-pulse rounded-md bg-gray-700"></div>
                                      <div className="flex animate-pulse flex-col">
                                        <div className="animate-pulse text-sm font-medium">
                                          loading...
                                        </div>
                                        <div className="animate-pulse text-xs opacity-80">
                                          loading...
                                        </div>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                          </ScrollArea>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <Separator className="mt-2" />
            <Accordion type="single" collapsible className="border-none">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm">Config</AccordionTrigger>
                <AccordionContent className="flex w-full flex-col gap-4 p-1">
                  <InputPrimitive
                    control={form.control}
                    name="limit"
                    inputType={"number"}
                    label={"Limit"}
                    placeholder="20"
                    register={register}
                    description={`The maximum number of items to return. Default: 20. Minimum: 1. 
                              
                  Maximum: 50.
                  Default: limit=20
                  Range: 0 - 50
                  Example: limit=10`}
                  />
                  <InputPrimitive
                    control={form.control}
                    name="offset"
                    inputType={"number"}
                    label={"Offset"}
                    placeholder="0"
                    register={register}
                    description={`The index of the first item to return. Default: 0 (the first item). Use with limit to get the next set of items.

                  Default: offset=0
                  Example: offset=5`}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </form>
      </Form>
      <Debug
        id={id}
        isValid={formState.isValid}
        TargetConnections={TargetConnections}
        SourceConnections={SourceConnections}
      />
    </CardWithHeader>
  );
}

export default PlaylistComponent;
