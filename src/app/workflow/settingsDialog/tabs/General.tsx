import { Copy, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useClipboard from "@/hooks/useClipboard";
import useStore from "~/app/states/store";

const General = ({ form, onSubmit }) => {
  const { copied, copyToClipboard } = useClipboard();
  const { flowState } = useStore((state) => ({
    flowState: state.flowState,
  }));

  const { handleSubmit } = form;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <h2 className="mb-2 text-xl font-semibold leading-none tracking-tight">
          Workflow Info
        </h2>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="name">Name</Label>
              <Input
                {...field}
                id="name"
                placeholder="My Workflow"
                className="w-full"
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="description">Description</Label>
              <Input
                {...field}
                id="description"
                placeholder="A short description for your workflow"
                className="w-full"
              />
            </FormItem>
          )}
        />
        <div className="space-y-1">
          <Label htmlFor="workflow-id">Workflow ID</Label>
          <div
            className="group flex h-10 w-full cursor-copy items-center justify-between rounded-md border bg-white/5 px-3 py-2 text-sm"
            onClick={() => copyToClipboard(flowState?.id ?? "")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                copyToClipboard(flowState?.id ?? "");
              }
            }}
          >
            <p className="opacity-80">{flowState?.id}</p>
            <div className="flex items-center gap-2 opacity-50 group-hover:opacity-80">
              {copied ? (
                <>
                  Copied!
                  <Info size={20} />
                </>
              ) : (
                <>
                  Click to copy
                  <Copy size={20} />
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground opacity-80">
            Use this ID to reference your workflow in the API
          </p>
        </div>
        <Button size="sm" className="w-fit" type="submit">
          {flowState.id ? "Update workflow" : "Create workflow"}
        </Button>
      </form>
    </Form>
  );
};

export default General;
