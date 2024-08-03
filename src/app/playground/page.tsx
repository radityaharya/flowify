"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

const CronExpressionGenerator = () => {
  const [schedule, setSchedule] = useState("daily");
  const [hour, setHour] = useState("0");
  const [minute, setMinute] = useState("0");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [cronExpression, setCronExpression] = useState("");

  const generateCronExpression = () => {
    let expression = "";
    switch (schedule) {
      case "daily":
        expression = `${minute} ${hour} * * *`;
        break;
      case "weekly":
        expression = `${minute} ${hour} * * ${dayOfWeek}`;
        break;
      case "monthly":
        expression = `${minute} ${hour} ${dayOfMonth} * *`;
        break;
      default:
        expression = "* * * * *";
    }
    setCronExpression(expression);
  };

  useEffect(() => {
    generateCronExpression();
  }, [schedule, hour, minute, dayOfWeek, dayOfMonth]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cron Expression Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="schedule">Schedule Type</Label>
            <select
              id="schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full mt-1"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hour">Hour (0-23)</Label>
              <Input
                type="number"
                id="hour"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="minute">Minute (0-59)</Label>
              <Input
                type="number"
                id="minute"
                min="0"
                max="59"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-full mt-1"
              />
            </div>
          </div>

          {schedule === "weekly" && (
            <div>
              <Label htmlFor="dayOfWeek">Day of Week (0-6, Sunday = 0)</Label>
              <Input
                type="number"
                id="dayOfWeek"
                min="0"
                max="6"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full mt-1"
              />
            </div>
          )}

          {schedule === "monthly" && (
            <div>
              <Label htmlFor="dayOfMonth">Day of Month (1-31)</Label>
              <Input
                type="number"
                id="dayOfMonth"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                className="w-full mt-1"
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Label htmlFor="cronExpression">Generated Cron Expression:</Label>
        <Input
          id="cronExpression"
          value={cronExpression}
          readOnly
          className="w-full mt-1"
        />
        <Button onClick={generateCronExpression} className="mt-4">
          Generate Cron Expression
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CronExpressionGenerator;
