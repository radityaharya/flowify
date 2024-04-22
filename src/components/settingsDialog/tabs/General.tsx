import { Copy, Info } from "lucide-react";
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useClipboard from "@/hooks/useClipboard";
import useStore from "~/app/states/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import reactFlowToWorkflow from "@/app/utils/reactFlowToWorkflow";
import { saveWorkflow } from "@/app/utils/saveWorkflow";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  description: z.string().default(""),
});

const General = () => {
  const { copied, copyToClipboard } = useClipboard();
  const { flowState, setFlowState, nodes, edges } = useStore((state) => ({
    flowState: state.flowState,
    setFlowState: state.setFlowState,
    nodes: state.nodes,
    edges: state.edges,
  }));

  const form = useForm({
    resolver: zodResolver(formSchema),
    shouldUnregister: false,
    mode: "all",
  });

  const { formState, register, handleSubmit } = form;
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setFlowState({
      ...flowState,
      name: data.name,
      description: data.description,
    });
    const { workflowResponse, errors } = await reactFlowToWorkflow({
      nodes,
      edges,
    });
    const saveResponse = await saveWorkflow(workflowResponse);
    setFlowState({
      description: data.description,
      name: data.name,
      id: saveResponse.id,
    });
    if (saveResponse) {
      toast.success(flowState.id ? "Workflow updated" : "Workflow created");
    }
    router.push(`/workflow/${saveResponse.id}`);
  };

  useEffect(() => {
    console.log(flowState);
    if (flowState) {
      form.setValue("name", flowState.name);
      form.setValue("description", flowState.description);
    }
  }, [flowState]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <h2 className="mb-2 text-xl font-semibold leading-none tracking-tight">
          Workflow Info
        </h2>
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input
            {...register("name")}
            id="name"
            placeholder="My Workflow"
            className="w-full"
            data-1p-ignore
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="short-desc">Description</Label>
          <Input
            {...register("description")}
            id="short-desc"
            placeholder="A short description for your workflow"
            className="w-full"
            data-1p-ignore
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="workflow-id">Workflow ID</Label>
          <div
            className="group flex h-10 w-full cursor-copy flex-row justify-between rounded-md border border-input bg-white/5 px-3 py-2 text-sm outline-1 outline-slate-700 ring-offset-background hover:border-accent hover:outline"
            onClick={() =>
              copyToClipboard("1f77c5cb-faee-4b79-aec3-8fba9f3b7711")
            }
          >
            <p className="opacity-80">{flowState?.id}</p>
            <div>
              {copied ? (
                <div className="flex items-center gap-2 opacity-50 transition-all duration-200 group-hover:opacity-80">
                  Copied!
                  <Info
                    size={20}
                    className="opacity-50 transition-all duration-200 group-hover:opacity-80"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 opacity-50 transition-all duration-200 group-hover:opacity-80">
                  Click to copy
                  <Copy
                    size={20}
                    className="opacity-50 transition-all duration-200 group-hover:opacity-80"
                  />
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground opacity-80">
            Use this ID to reference your workflow in the API
          </p>
        </div>
        <Button size="sm" className="w-[fit-content]" type="submit">
          {flowState.id ? "Update workflow" : "Create workflow"}
        </Button>
      </div>
    </form>
  );
};

export default General;
