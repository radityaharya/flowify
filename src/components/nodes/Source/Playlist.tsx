/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { Check, ChevronsUpDown } from "lucide-react"

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
import Image from "next/image";

// interface Playlist {
//   id: string;
//   name: string;
//   description: string;
//   image: string;
// }

export default memo(
  ({ data, isConnectable }: { data: any; isConnectable: boolean }) => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [selectedPlaylist, setSelectedPlaylist] = React.useState<{id?: string, name?: string, description?: string, image?: string}>({});
    const [playlists, setPlaylists] = React.useState<{id: string, name: string, description: string, image: string}[]>([]);
    const playlistsInit = [
      {
        id: "1",
        name: "comfy",
        description: "Playlist 1 description",
        image: "https://i.scdn.co/image/ab67706c0000da84df7e49d6d0d0ea2ca0c7683f",
      },
      {
        id: "2",
        name: "mbrrr",
        description: "Playlist 2 description",
        image: "https://i.scdn.co/image/ab67616d000048519279c66a0677872a9900a187",
      },
      {
        id: "3",
        name: "Banger",
        description: "Banger description",
        image: "https://i.scdn.co/image/ab67706c0000da8414267646d33e4158173b668e",
      },
    ]
    React.useEffect(() => {
      setPlaylists(playlistsInit)
    } , [])

    return (
      <Card className="w-[250px]">
        {/* <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      /> */}
        <CardHeader>
          <CardTitle>Playlist</CardTitle>
          {/* <CardDescription>
            
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between h-20"
              >
                {/* {value
                  ? frameworks.find((framework) => framework.value === value)
                      ?.label
                  : "Select framework..."} */}
                  {/* <div className="flex items-center gap-2">
                    <Image
                      className="w-8 h-8 rounded-full"
                      src={selected.image}
                      alt=""
                    />
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-white">
                        {selected.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {selected.description}
                      </div>
                    </div>
                  </div> */}
                  {selectedPlaylist.image
                    ? (
                      <div className="flex items-start gap-2">
                        <Image
                          className="w-8 h-8 rounded-sm"
                          src={selectedPlaylist.image}
                          alt=""
                          width={32}
                          height={32}
                        />
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-white">
                            {selectedPlaylist.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {selectedPlaylist.description}
                          </div>
                        </div>
                      </div>
                    )
                    : "Select playlist..."
                  }
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search framework..." />
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {/* {frameworks.map((framework) => (
                    <CommandItem
                      key={framework.value}
                      value={framework.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === framework.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {framework.label}
                    </CommandItem>
                  ))} */}
                  { playlists.length > 0 ?
                  playlists.map((playlist) => (
                      <CommandItem
                        key={playlist.id}
                        value={playlist.name}
                        onSelect={(currentValue) => {
                          setSelectedPlaylist({
                            id: playlist.id,
                            name: playlist.name,
                            description: playlist.description,
                            image: playlist.image,
                          })
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            className="w-8 h-8 rounded-sm"
                            src={playlist.image}
                            alt=""
                            width={32}
                            height={32}
                          />
                          <div className="flex flex-col">
                            <div className="text-sm font-medium">
                              {playlist.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {playlist.description}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))
                    : (
                      <CommandItem
                        key="loading"
                        value="loading"
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue);
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse w-8 h-8 rounded-full bg-gray-700"></div>
                          <div className="animate-pulse flex flex-col">
                            <div className="animate-pulse text-sm font-medium text-white">
                              loading...
                            </div>
                            <div className="animate-pulse text-xs text-gray-400">
                              loading...
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    )
                  }
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
        {/* <input
          className="nodrag"
          type="color"
          onChange={data.onChange}
          defaultValue={data.color}
        /> */}
        {/* <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ top: 10, background: '#555' }}
        isConnectable={isConnectable}
      /> */}
        <Handle
          type="source"
          position={Position.Top}
          id="b"
          // style={{ bottom: 10, top: "auto", background: "#555" }}
          isConnectable={isConnectable}
        />
      </Card>
    );
  },
);
