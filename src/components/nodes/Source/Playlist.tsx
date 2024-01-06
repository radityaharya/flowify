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

type PlaylistProps = {
  id: string;
  data: any;
};

type Playlist = {
  id?: string;
  name?: string;
  description?: string;
  image?: string;
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
  <CommandItem key={playlist.id} value={playlist.name} onSelect={onSelect}>
    <div className="flex items-center gap-2">
      <Image
        className="h-8 w-8 rounded-sm"
        src={playlist.image ?? "/images/spotify.png"}
        alt=""
        width={32}
        height={32}
      />
      <div className="flex flex-col">
        <div className="text-sm font-medium">{playlist.name}</div>
        <div className="text-xs text-gray-400">{playlist.description}</div>
      </div>
    </div>
  </CommandItem>
);

const PlaylistComponent: React.FC<PlaylistProps> = React.memo(({ id, data }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = React.useState<Playlist>({});
  const userPlaylists = useStore((state) => state.userPlaylists);


  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "all",
    shouldUnregister: false,
  });
  const { formState, register } = form;

  const { updateNodeData } = useReactFlow();
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
      });
    }
    prevWatchRef.current = watch;
  }, [watch]);

  const handleSelect = React.useCallback((playlist) => {
    form.setValue("playlistId", playlist.id, {
      shouldValidate: true,
    });
    setSelectedPlaylist(playlist as Playlist);
    setOpen(false);
  }, []);


  return (
    <CardWithHeader
      title="Playlist"
      type="Source"
      status={formState.isValid ? "success" : "error"}
      info="Get a list of the songs in a playlist."
    >
      <Handle
        type="source"
        position={Position.Right}
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
                        <div className="flex items-start gap-2">
                          <Image
                            className="h-8 w-8 rounded-sm"
                            src={selectedPlaylist.image}
                            alt=""
                            width={32}
                            height={32}
                          />
                          <div className="flex flex-col items-start">
                            <div className="text-sm font-medium text-white">
                              {selectedPlaylist.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {selectedPlaylist.description}
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
                      <CommandInput placeholder="Search playlist..." />
                      <CommandEmpty>No playlist found.</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px] w-full rounded-md">
                          {userPlaylists.length > 0 ? (
                            userPlaylists.map((playlist) => (
                              <PlaylistItem
                                key={playlist.id}
                                playlist={playlist}
                                onSelect={() => handleSelect(playlist)}
                              />
                            ))
                          ) : (
                            <CommandItem
                              key="loading"
                              value="loading"
                              onSelect={() => {
                                setSelectedPlaylist({
                                  id: "loading",
                                  name: "loading",
                                  description: "loading",
                                  image: "",
                                });
                                setOpen(false);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 animate-pulse rounded-md bg-gray-700"></div>
                                <div className="flex animate-pulse flex-col">
                                  <div className="animate-pulse text-sm font-medium text-white">
                                    loading...
                                  </div>
                                  <div className="animate-pulse text-xs text-gray-400">
                                    loading...
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
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
      <CardFooter>
        {/* <Button
          variant="default"
          className="w-full"
          onClick={() => {
            console.log("nodeData", nodeData);
            console.log("TargetConnections", TargetConnections);
            console.log("SourceConnections", SourceConnections);
            console.log("errors", formState.errors);
          }}
        >
          <Check className="mr-2 h-4 w-4" />
          debug
        </Button> */}
      </CardFooter>
    </CardWithHeader>
  );
});

export default React.memo(PlaylistComponent);
