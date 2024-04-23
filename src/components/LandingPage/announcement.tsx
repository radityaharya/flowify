import Link from "next/link";

import { Separator } from "@/components/ui/separator";

export function Announcement() {
  return (
    <Link
      href="#"
      className="inline-flex items-center rounded-lg bg-muted px-3 py-1 font-medium text-sm"
    >
      ⚠️
      <Separator className="mx-2 h-4" orientation="vertical" />{" "}
      <span className="sm:hidden">Work in progress</span>
      <span className="hidden sm:inline">Work in progress</span>
      <Separator className="mx-2 h-4" orientation="vertical" /> ⚠️
      {/* <ArrowRightIcon className="ml-1 h-4 w-4" /> */}
    </Link>
  );
}
