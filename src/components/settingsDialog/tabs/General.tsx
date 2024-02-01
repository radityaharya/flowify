import { Copy, Info } from "lucide-react";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useClipboard from "@/hooks/useClipboard";

const General = () => {
  const { copied, copyToClipboard } = useClipboard();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="mb-2 text-xl font-semibold leading-none tracking-tight">
        Workflow Info
      </h2>
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="My Workflow"
          className="w-full"
          data-1p-ignore
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="short-desc">Description</Label>
        <Input
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
          1f77c5cb-faee-4b79-aec3-8fba9f3b7711
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
      <Button size="sm" className="w-[fit-content]">
        Save changes
      </Button>
    </div>
  );
};

export default General;
