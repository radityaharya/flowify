// https://time.openstatus.dev/#time-picker-input.tsx

"use client";

import * as React from "react";
import { TimePickerInput } from "./time-picker-input";
import { TimePeriodSelect } from "./period-select";
import { Period } from './time-picker-utils';
import { Label } from "@/components/ui/label";

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function TimePicker12({ date, setDate }: TimePickerProps) {
  const [period, setPeriod] = React.useState<Period>("PM");

  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const periodRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="12hours"
          period={period}
          date={date}
          setDate={setDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
        <Label className="text-muted-foreground text-xs opacity-80">
          Hour
        </Label>
      </div>
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="minutes"
          id="minutes12"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => periodRef.current?.focus()}
        />
        <Label className="text-muted-foreground text-xs opacity-80">
          Minute
        </Label>
      </div>
      <div className="grid gap-1 text-center">
        <TimePeriodSelect
          period={period}
          setPeriod={setPeriod}
          date={date}
          setDate={setDate}
          ref={periodRef}
          onLeftFocus={() => minuteRef.current?.focus()}
        />
        <Label className="text-muted-foreground text-xs opacity-80">
          Period
        </Label>
      </div>
    </div>
  );
}
