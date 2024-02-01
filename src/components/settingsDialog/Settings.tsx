import { CalendarClockIcon, HistoryIcon, SettingsIcon } from "lucide-react";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import General from "./tabs/General";
export function SettingsDialog() {
  return (
    <DialogContent className="h-[90svh] w-[90svw]">
      <DialogHeader className="gap-1 pb-8">
        <DialogTitle className="mb-4 text-xl font-bold">
          Workflow Settings
        </DialogTitle>
        <Separator />
      </DialogHeader>
      <Tabs
        defaultValue="general"
        className="flex h-full w-full flex-row gap-6"
      >
        <TabsList className="flex w-[15%] flex-col gap-6">
          <TabsTrigger value="general">
            <SettingsIcon size={20} />
            General
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <CalendarClockIcon size={20} />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="history">
            <HistoryIcon size={20} />
            History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="h-full w-full">
          <General />
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}
