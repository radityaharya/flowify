import { CalendarClockIcon, HistoryIcon, SettingsIcon } from "lucide-react";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import General from "./tabs/General";
import History from "./tabs/History";
export function SettingsDialog() {
  return (
    <DialogContent className="h-[90svh] w-[90svw]">
      <DialogHeader className="gap-1">
        <DialogTitle className="mb-4 text-xl font-bold">
          Workflow Settings
        </DialogTitle>
        <Separator />
      </DialogHeader>
      <Tabs
        defaultValue="general"
        className="flex h-full w-full flex-row gap-6"
      >
        <TabsList className="flex w-[15%] flex-col gap-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="h-full w-full">
          <General />
        </TabsContent>
        <TabsContent value="schedule" className="h-full w-full">
          Schedule
        </TabsContent>
        <TabsContent value="history" className="h-full w-full">
          <History />
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}
