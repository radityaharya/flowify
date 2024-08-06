/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Position } from "@xyflow/react";
import NodeHandle from "../Primitives/NodeHandle";

import React from "react";

import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
import { Separator } from "~/components/ui/separator";

import { CardWithHeader } from "../Primitives/Card";
import InputPrimitive from "../Primitives/Input";

import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { usePlaylistState } from "~/hooks/usePlaylistState";
import Debug from "../Primitives/Debug";
import PlaylistCommand from "../Primitives/PlaylistCommand";

type PlaylistProps = {
  id: string;
  // TODO type on playlist
  data: Workflow.Playlist;
};

const PlaylistComponent: React.FC<PlaylistProps> = ({ id, data }) => {
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
      title={`Playlist`}
      id={id}
      type="Source"
      status={formState!.isValid ? "success" : "error"}
      info="Get a list of the songs in a playlist."
    >
      <NodeHandle
        type="source"
        position={Position.Right}
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
                              <div className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap font-medium text-sm">
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
                                        <div className="h-8 w-8 animate-pulse rounded-md bg-gray-700"></div>
                                        <div className="flex animate-pulse flex-col">
                                          <div className="animate-pulse font-medium text-sm">
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
            <Separator className="mt-2" />
            <Accordion type="single" collapsible className="border-none">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm">Config</AccordionTrigger>
                <AccordionContent className="flex w-full flex-col gap-4 p-1">
                  <InputPrimitive
                    control={form!.control}
                    name="limit"
                    inputType={"number"}
                    label={"Limit"}
                    placeholder="20"
                    register={register!}
                    description={`The maximum number of items to return. Default: 20. Minimum: 1. 
                              
                  Maximum: 50.
                  Default: limit=20
                  Range: 0 - 50
                  Example: limit=10`}
                  />
                  <InputPrimitive
                    control={form!.control}
                    name="offset"
                    inputType={"number"}
                    label={"Offset"}
                    placeholder="0"
                    register={register!}
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
        isValid={formState!.isValid}
        TargetConnections={targetConnections}
        SourceConnections={sourceConnections}
      />
    </CardWithHeader>
  );
};

export default PlaylistComponent;
