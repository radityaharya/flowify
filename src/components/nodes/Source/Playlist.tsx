/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { memo } from "react";
import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";

import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useShallow } from "zustand/react/shallow";
import { debounce } from 'radash'

type PlaylistProps = {
  id: string;
  data: any;
};

type Playlist = {
  playlistId?: string;
  name?: string;
  description?: string;
  image?: string;
  total?:number;
  owner?:string;
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
  <CommandItem key={playlist.playlistId} value={playlist.name} onSelect={onSelect}>
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
        <span className="text-xs text-gray-400">{playlist.owner} - {playlist.total} tracks</span>
      </div>
    </div>
  </CommandItem>
);

const PlaylistComponent: React.FC<PlaylistProps> = React.memo(({ id, data }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = React.useState<Playlist>({});
  const [search, setSearch] = React.useState('')

  const nodes = useStore((state) => state.nodes);

  const {session, updateNodeData, userPlaylists} = useStore(useShallow((state) => ({ session: state.session, updateNodeData:state.updateNodeData, userPlaylists:state.userPlaylists })));

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "all",
    shouldUnregister: false,
  });
  const { formState, register } = form;

  // const { updateNodeData } = useReactFlow();
  const TargetConnections = useHandleConnections({
    type: "target",
  });
  const SourceConnections = useHandleConnections({
    type: "source",
  });

  const nodeData = useNodesData(id);
  const watch = form.watch();
  const prevWatchRef = React.useRef(watch);

  React.useEffect(() => {
    console.log("nodeData", nodeData);
    console.log("TargetConnections", TargetConnections);
    console.log("SourceConnections", SourceConnections);
    console.log("errors", formState.errors);
    if (JSON.stringify(prevWatchRef.current) !== JSON.stringify(watch)) {
      updateNodeData(id, {
        ...watch,
        ...selectedPlaylist,
      });
    }
    prevWatchRef.current = watch;
  }, [watch]);

  React.useEffect(() => {
    const searchPlaylist = async () => {
      if (search.length > 0) {
        try {
          const response = await fetch(`/api/user/${session.user.providerAccountId}/playlists?q=${search}`);
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
        const response = await fetch(`/api/user/${session.user.providerAccountId}/playlists`);
        const data = await response.json();
        console.log(data);
        useStore.setState({ userPlaylists: data });
      } catch (err) {
        console.error(err);
      }
    }

    function setUserPlaylists() {
    if (search.length > 0) {
      searchPlaylist().catch((err) => {
        console.error(err);
      }
      );
    }
    else {
      userPlaylists().catch((err) => {
        console.error(err);
      });
    }
  }

  debounce({delay: 500}, setUserPlaylists)();
  }, [search]);

  const handleSelect = React.useCallback((playlist) => {
    form.setValue("playlistId", playlist.playlistId, {
      shouldValidate: true,
    });
    setSelectedPlaylist(playlist as Playlist);
    setOpen(false);
  }, []);

  function getNodeData(id: string) {
    return nodes.find((node) => node.id === id)?.data;
  }

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
                        <div className="flex items-center gap-4 max-w-full">
                          <Image
                            className="h-10 w-10 rounded-sm"
                            src={selectedPlaylist.image}
                            alt=""
                            width={40}
                            height={40}
                            unoptimized
                          />
                          <div className="flex flex-col items-start w-[160px]">
                            <div className="text-sm font-medium max-w-full overflow-hidden whitespace-nowrap overflow-ellipsis">
                              {selectedPlaylist.name}
                            </div>
                            <div className="text-xs opacity-80">
                              {selectedPlaylist.owner} - {selectedPlaylist.total} tracks
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
                      <CommandInput placeholder="Search playlist..." value={search} onValueChange={(e) => setSearch(e)} />
                      <CommandEmpty>No playlist found.</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px] w-full rounded-md">
                          {userPlaylists.length > 0 ? (
                            userPlaylists.map((playlist) => (
                              <PlaylistItem
                                key={playlist.playlistId}
                                playlist={playlist}
                                onSelect={() => handleSelect(playlist)}
                              />
                            ))
                          ) : (
                            Array.from({ length: 3 }).map((_, index) => (
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
                            ))
                          )}
                        </ScrollArea>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
          <Separator className="mt-2" />
          <Accordion
            type="single"
            collapsible
            className="border-none"
          >
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
        </form>
      </Form>
      <Separator />
          <div className="whitespace-pre-wrap rounded-md bg-red-500 p-2 py-2">
            <pre className="whitespace-pre-wrap text-sm font-bold">
              Debug info
            </pre>
            <pre>
              <pre className="text-xs">id: {id}</pre>
              <pre className="text-xs">isValid: {formState.isValid.toString()}</pre>
              <pre className="text-xs whitespace-pre-wrap break-all">data: {JSON.stringify(getNodeData(id), null, 2)}</pre>
            </pre>
            <ScrollArea className="nodrag flex max-h-[200px] flex-col gap-2 overflow-auto overflow-x-hidden py-2">
              <pre className="text-xs">TargetConnections:</pre>
              {TargetConnections?.map((connection) => (
                <pre key={connection.source} className="py-1 text-xs">
                  <pre>source: {connection.source}</pre>
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(getNodeData(connection.source), null, 2)}
                  </pre>
                </pre>
              ))}

              <pre className="text-xs">SourceConnections:</pre>
              {SourceConnections?.map((connection) => (
                <pre key={connection.source} className="py-1 text-xs">
                  <pre>source: {connection.source}</pre>
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(getNodeData(connection.target), null, 2)}
                  </pre>
                </pre>
              ))}
            </ScrollArea>
          </div>
      <CardFooter>
      </CardFooter>
    </CardWithHeader>
  );
});

export default React.memo(PlaylistComponent);
