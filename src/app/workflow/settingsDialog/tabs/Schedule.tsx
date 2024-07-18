"use client";

import { saveWorkflow } from "@/app/utils/saveWorkflow";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import useStore from "~/app/states/store";

import { TimePicker12 } from "@/components/ui/time-picker/time-picker-12h";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";

const formSchema = z.object({
  interval: z.string().default("daily"),
  time: z.string().default("00:00"),
  dow: z.string().default("*"),
});

const Schedule = () => {
  const { flowState, setFlowState } = useStore((state) => ({
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

  const router = useRouter();

  const onSubmit = async (data: any) => {
    const cronExpression = getCronExpression();

    setFlowState({
      ...flowState,
      cron: cronExpression,
    });

    try {
      const saveResponse = await saveWorkflow();
      const formatedName = saveResponse.workflow.name
        .replace(/ /g, "-")
        .toLowerCase();

      router.push(`/workflow/${formatedName}_${saveResponse.id}`);
    } catch (error) {
      console.error("Error saving workflow", error);
    }
  };

  const parseCronExpression = (cronExpression: string) => {
    const [minute, hour, , , day] = cronExpression.split(" ") as [
      string,
      string,
      string,
      string,
      string,
    ];
    let interval = "daily";
    let dow = "*";

    if (day === "1") {
      interval = "monthly";
    } else if (day === "0") {
      interval = "weekly";
    } else {
      dow = day;
    }

    const time = new Date();
    time.setHours(parseInt(hour, 10));
    time.setMinutes(parseInt(minute, 10));

    return { interval, time, dow };
  };

  const getCronExpression = () => {
    const { interval, time } = form.getValues();
    if (interval === "daily") {
      return `0 ${time.getHours()} ${time.getMinutes()} * * *`;
    } else if (interval === "weekly") {
      return `0 ${time.getHours()} ${time.getMinutes()} * * 0`;
    } else if (interval === "monthly") {
      return `0 ${time.getHours()} ${time.getMinutes()} 1 * *`;
    } else if (interval === "custom") {
      return `0 ${time.getHours()} ${time.getMinutes()} * * ${time.getDay()}`;
    } else if (interval === "unset") {
      return "unset";
    } else if (interval === "once") {
      return `0 ${time.getHours()} ${time.getMinutes()} ${time.getDate()} ${
        time.getMonth() + 1
      } *`;
    }
    return "";
  };

  useEffect(() => {
    const { interval, time } = parseCronExpression(flowState.cron ?? "unset");

    if (flowState) {
      form.reset({
        interval,
        time,
        dow: time.getDay(),
      });
    }

  }, [flowState, form]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h2 className="mb-2 font-semibold text-xl leading-none tracking-tight">
          Schedule
        </h2>
        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="interval">Interval</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an interval" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Interval</SelectLabel>
                    <SelectItem value="unset">Unset</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormLabel htmlFor="interval">Time</FormLabel>
        <TimePicker12 date={form.getValues("time")} setDate={form.getValues} />
        <Button size="sm" className="w-[fit-content]" type="submit">
          {flowState.id ? "Update workflow" : "Create workflow"}
        </Button>
      </form>
    </Form>
  );
};

export default Schedule;
