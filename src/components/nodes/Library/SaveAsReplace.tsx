"use client";
import { Position } from "@xyflow/react";
import { ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlaylistState } from "~/hooks/usePlaylistState";

import { CardWithHeader } from "../Primitives/Card";
import Debug from "../Primitives/Debug";
import NodeHandle from "../Primitives/NodeHandle";
import PlaylistCommand from "../Primitives/PlaylistCommand";

type PlaylistProps = {
  id: string;
  data: Workflow.Playlist;
};

const formSchema = z.object({
  playlistId: z.string().min(1, {
    message: "Playlist is required.",
  }),
});

function SaveAsReplaceComponent({ id, data }: PlaylistProps) {
  const {
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
  } = usePlaylistState(id, data);

  return (
    <CardWithHeader
      title={`Save as Replace`}
      id={id}
      type="Library"
      status={formState!.isValid ? "success" : "error"}
      info="Replaces the tracks in the selected playlist"
    >
      <NodeHandle
        type="source"
        position={Position.Right}
        style={{ background: "#555" }}
      />
      <NodeHandle
        type="target"
        position={Position.Left}
        style={{ background: "#555" }}
      />
      <Form {...form!}>
        <form onSubmit={form!.handleSubmit((data) => console.info(data))}>
          <div className="flex flex-col gap-4">
            <FormField
              control={form!.control}
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
                        className="h-min w-full justify-between"
                      >
                        {selectedPlaylist.image ? (
                          <div className="flex max-w-full items-center gap-4">
                            <Image
                              className="size-10 rounded-sm"
                              src={selectedPlaylist.image}
                              alt=""
                              width={40}
                              height={40}
                              unoptimized
                            />
                            <div className="flex w-[160px] flex-col items-start">
                              <div className="max-w-full truncate text-sm font-medium">
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
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
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
                          <CommandList>
                            <ScrollArea className="h-[200px] w-full rounded-md">
                              {userPlaylists.length > 0
                                ? userPlaylists.map((playlist) => (
                                    <PlaylistCommand
                                      key={playlist.playlistId}
                                      playlist={playlist}
                                      onSelect={() => handleSelect(playlist)}
                                    />
                                  ))
                                : Array.from({ length: 3 }).map((_, index) => (
                                    <CommandItem
                                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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
                                        <div className="size-8 animate-pulse rounded-md bg-gray-700"></div>
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
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
      <Debug
        id={id}
        isValid={formState!.isValid}
        TargetConnections={targetConnections}
        SourceConnections={sourceConnections}
      />
    </CardWithHeader>
  );
}

export default SaveAsReplaceComponent;
