import parser from "cron-parser";

/**
 * Parses a cron expression and returns the schedule details.
 *
 * @param cronExpression - The cron expression to parse.
 * @returns An object containing the schedule details.
 */
export const getScheduleFromCronExpression = (cronExpression) => {
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

/**
 * Gets the next run time and the minutes until the next run based on a cron expression.
 * @param cronExpression - The cron expression to parse.
 * @returns An object containing the next run time and the minutes until the next run.
 */
export function getNextRunInfo(cronExpression: string) {
  try {
    const interval = parser.parseExpression(cronExpression);
    const nextRun = interval.next().toDate();
    const now = new Date();
    const minutesUntilNextRun = Math.ceil(
      (nextRun.getTime() - now.getTime()) / 60000,
    );

    return {
      nextRun,
      minutesUntilNextRun,
    };
  } catch (err) {
    console.error("Error parsing cron expression:", err);
    return null;
  }
}
