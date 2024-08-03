"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import router from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import useStore from "~/app/states/store";
import { saveWorkflow } from "~/app/utils/saveWorkflow";
import { Separator } from "../../../components/ui/separator";
import General from "./tabs/General";
import History from "./tabs/History";
import Schedule from "./tabs/Schedule";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  description: z.string().default(""),
  interval: z.string().default("daily"),
  scheduleTime: z
    .date()
    .default(() => new Date(new Date().setHours(0, 0, 0, 0))),
  dayOfWeek: z.string().default("*"),
  dayOfMonth: z.string().default("*"),
});

const getScheduleFromCronExpression = (cronExpression) => {
  if (!cronExpression || cronExpression === "unset") {
    return {
      interval: "unset",
      scheduleTime: new Date(),
      dayOfWeek: "*",
      dayOfMonth: "*",
    };
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] =
    cronExpression.split(" ");
  let interval =
    dayOfWeek !== "*" && dayOfMonth === "*"
      ? "weekly"
      : dayOfMonth !== "*" && dayOfWeek === "*"
        ? "monthly"
        : dayOfMonth === "1" && month === "1"
          ? "yearly"
          : "daily";
  const scheduleTime = new Date();
  scheduleTime.setHours(parseInt(hour, 10));
  scheduleTime.setMinutes(parseInt(minute, 10));

  return {
    interval,
    scheduleTime,
    dayOfWeek: dayOfWeek === "*" ? "0" : dayOfWeek,
    dayOfMonth: dayOfMonth === "*" ? "1" : dayOfMonth,
  };
};

const UNSET_SCHEDULE = "unset";

const getCronExpression = (form) => {
  const { interval, scheduleTime, dayOfWeek, dayOfMonth } = form.getValues();
  const minutes = scheduleTime.getMinutes();
  const hours = scheduleTime.getHours();

  switch (interval) {
    case "daily":
      return `${minutes} ${hours} * * *`;
    case "weekly":
      return `${minutes} ${hours} * * ${dayOfWeek}`;
    case "monthly":
      return `${minutes} ${hours} ${dayOfMonth} * *`;
    case "yearly":
      return `${minutes} ${hours} 1 1 *`;
    case UNSET_SCHEDULE:
      return UNSET_SCHEDULE;
    default:
      return "";
  }
};

export function SettingsDialog() {
  const { flowState, setFlowState } = useStore((state) => ({
    flowState: state.flowState,
    setFlowState: state.setFlowState,
  }));

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      name: flowState.name,
      description: flowState.description,
      interval: flowState.cron
        ? getScheduleFromCronExpression(flowState.cron).interval
        : "unset",
      scheduleTime: flowState.cron
        ? getScheduleFromCronExpression(flowState.cron).scheduleTime
        : new Date(new Date().setHours(0, 0, 0, 0)),
      dayOfWeek: flowState.cron
        ? getScheduleFromCronExpression(flowState.cron).dayOfWeek
        : "*",
      dayOfMonth: flowState.cron
        ? getScheduleFromCronExpression(flowState.cron).dayOfMonth
        : "*",
    },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    reset({
      name: flowState.name,
      description: flowState.description,
      interval: flowState.cron
        ? getScheduleFromCronExpression(flowState.cron).interval
        : "unset",
      scheduleTime: flowState.cron
        ? getScheduleFromCronExpression(flowState.cron).scheduleTime
        : new Date(new Date().setHours(0, 0, 0, 0)),
      dayOfWeek: flowState.cron
        ? getScheduleFromCronExpression(flowState.cron).dayOfWeek
        : "*",
      dayOfMonth: flowState.cron
        ? getScheduleFromCronExpression(flowState.cron).dayOfMonth
        : "*",
    });
  }, [flowState, reset]);

  const onSubmit = async (data) => {
    const cron = getCronExpression(form);
    const updatedData = { ...data, cron };
    setFlowState({ ...flowState, ...updatedData });
    try {
      const saveResponse = await saveWorkflow();
      const formattedName = saveResponse.workflow.name
        .replace(/ /g, "-")
        .toLowerCase();
      router.replace(`/workflow/${formattedName}_${saveResponse.id}`);
    } catch (error) {
      console.error("Error saving workflow", error);
    }
  };

  return (
    <DialogContent className="h-[90svh] w-[90svw]">
      <DialogHeader className="gap-1">
        <DialogTitle className="mb-4 font-bold text-xl">
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
          <General form={form} onSubmit={handleSubmit(onSubmit)} />
        </TabsContent>
        <TabsContent value="schedule" className="h-full w-full">
          <Schedule form={form} onSubmit={handleSubmit(onSubmit)} />
        </TabsContent>
        <TabsContent value="history" className="h-full w-full">
          <History />
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}
