"use client";

import React from "react";
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
import { useForm } from "react-hook-form";
import cronstrue from "cronstrue";
import { Button } from "@/components/ui/button";

const parseCronExpression = (cronExpression = "0 0 * * *") => {
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

const PlaygroundPage: React.FC<{ initialCron?: string }> = ({
  initialCron = "0 5 * * *",
}) => {
  const { interval, time } = parseCronExpression(initialCron);

  const form = useForm({
    defaultValues: {
      interval,
      time,
    },
  });

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
    } else if (interval === "once") {
      return `0 ${time.getHours()} ${time.getMinutes()} ${time.getDate()} ${
        time.getMonth() + 1
      } *`;
    }
    return "";
  };

  const onSubmit = (data: any) => {
    console.info(data);
  };

  return (
    <div className="container mx-auto p-6 min-h-[100svh]">
      <Form {...form}>
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <h2 className="text-xl font-bold">Schedule</h2>
          <FormField
            control={form.control}
            name="interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interval</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select an interval" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Interval</SelectLabel>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <TimePicker12 date={field.value} setDate={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-[180px]">Submit</Button>
          <div>
            <p>Cron Expression: {getCronExpression()}</p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PlaygroundPage;
