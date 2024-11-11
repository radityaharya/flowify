"use client";

import cronstrue from "cronstrue";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker12 } from "@/components/ui/time-picker/time-picker-12h";

interface FormValues {
  interval: string;
  scheduleTime: Date;
  dayOfWeek?: string;
  dayOfMonth?: string;
}

const UNSET_SCHEDULE = "unset";

interface WorkflowSchedulerProps {
  form: any;
  onSubmit: any;
}

const WorkflowScheduler: React.FC<WorkflowSchedulerProps> = ({
  form,
  onSubmit,
}) => {
  const [cronExpression, setCronExpression] = useState("");
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);

  const formValues = form.getValues();
  const { interval, scheduleTime, dayOfWeek, dayOfMonth } = formValues;

  const getCronExpression = useMemo(() => {
    const minutes = scheduleTime?.getMinutes() ?? 0;
    const hours = scheduleTime?.getHours() ?? 0;

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
  }, [interval, scheduleTime, dayOfWeek, dayOfMonth]);

  useEffect(() => {
    if (getCronExpression === UNSET_SCHEDULE) {
      setCronExpression("");
    } else {
      setCronExpression(getCronExpression);
    }
    setIsScheduleLoading(false);
  }, [getCronExpression]);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (form.formState.isValid) {
        setCronExpression(getCronExpression);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [form, getCronExpression]);

  const intervalValue = form.watch("interval");
  const memoizedInterval = useMemo(() => intervalValue, [intervalValue]);

  useEffect(() => {
    setIsScheduleLoading(false);
    if (memoizedInterval === UNSET_SCHEDULE) {
      setCronExpression("");
    }
  }, [memoizedInterval]);

  return (
    <Form {...form}>
      {!isScheduleLoading && (
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <h2 className="mb-2 text-xl font-semibold leading-none tracking-tight">
            Work Schedule
          </h2>
          <FormField
            control={form.control}
            name="interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="interval">Interval</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value={UNSET_SCHEDULE}>Unset</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          {form.watch("interval") === "weekly" && (
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="dayOfWeek">Day of week</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a day of week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}
          {form.watch("interval") === "monthly" && (
            <FormField
              control={form.control}
              name="dayOfMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="dayOfMonth">Day of month</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a day of month" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(31)].map((_, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}
          {form.watch("interval") !== UNSET_SCHEDULE && (
            <FormField
              control={form.control}
              name="scheduleTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="scheduleTime">Schedule Time</FormLabel>
                  <TimePicker12 setDate={field.onChange} date={field.value} />
                </FormItem>
              )}
            />
          )}
          <Alert>
            <AlertDescription>
              {cronExpression && cronExpression !== UNSET_SCHEDULE ? (
                <>
                  {cronExpression} | {cronstrue.toString(cronExpression)}
                </>
              ) : (
                <>No schedule set.</>
              )}
            </AlertDescription>
          </Alert>
          <Button size="sm" className="w-fit" type="submit">
            Save schedule
          </Button>
        </form>
      )}
    </Form>
  );
};

export default WorkflowScheduler;
