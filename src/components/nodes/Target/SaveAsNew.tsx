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
import { debounce } from "radash";

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
  name: z.string().min(1, {
    message: "Playlist is required.",
  }),
  isPublic: z.boolean(),
  collaborative: z.boolean(),
  description: z.string().optional(),
});

const saveAsNewComponent: React.FC<PlaylistProps> = React.memo(
  ({ id, data }) => {
    const nodes = useStore((state) => state.nodes);

    const { updateNodeData } = useStore(
      useShallow((state) => ({
        updateNodeData: state.updateNodeData,
      })),
    );

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
          name: watch.name,
          isPublic: watch.isPublic === "true",
          collaborative: watch.collaborative === "true",
          description: watch.description,
        });
      }
      prevWatchRef.current = watch;
    }, [watch]);

    function getNodeData(id: string) {
      return nodes.find((node) => node.id === id)?.data;
    }

    return (
      <CardWithHeader
        title="Save as New"
        type="Target"
        status={formState.isValid ? "success" : "error"}
        info="Get a list of the songs saved in your ‘Your Music’ library."
      >
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: "#555" }}
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => console.log(data))}>
            <div className="flex flex-col gap-2">
              <InputPrimitive
                control={form.control}
                name="name"
                inputType={"text"}
                label={"Playlist Name"}
                placeholder="20"
                register={register}
                description={``}
              />
              <Separator />
              <InputPrimitive
                control={form.control}
                name="isPublic"
                inputType={"select"}
                label={"Visibility"}
                placeholder="Public"
                register={register}
                selectOptions={[
                  { value: "true", label: "Public" },
                  { value: "false", label: "Private" },
                ]}
                description={``}
              />
              <Separator />
              <InputPrimitive
                control={form.control}
                name="collaborative"
                inputType={"select"}
                label={"Collaborative"}
                placeholder="No"
                register={register}
                selectOptions={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
                description={``}
              />
              <Separator />
              <InputPrimitive
                control={form.control}
                name="description"
                inputType={"textfield"}
                label={"Description"}
                placeholder="Playlist Description"
                register={register}
                description={``}
              />
            </div>
          </form>
        </Form>
        <Separator />
        <div className="whitespace-pre-wrap rounded-md bg-red-500 p-2 py-2">
          <pre className="whitespace-pre-wrap text-sm font-bold">
            Debug info
          </pre>
          <pre>
            <pre className="text-xs">id: {id}</pre>
            <pre className="text-xs">
              isValid: {formState.isValid.toString()}
            </pre>
            <pre className="whitespace-pre-wrap break-all text-xs">
              data: {JSON.stringify(getNodeData(id), null, 2)}
            </pre>
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
        <CardFooter></CardFooter>
      </CardWithHeader>
    );
  },
);

export default React.memo(saveAsNewComponent);
