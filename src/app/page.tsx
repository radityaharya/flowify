import Link from "next/link";

import { cn } from "@/lib/utils";
import { Announcement } from "@/components/LandingPage/announcement";
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/LandingPage/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";

export default async function IndexPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative">
      <PageHeader>
        <Announcement />
        <PageHeaderHeading>Better Playlists, Faster.</PageHeaderHeading>
        <PageHeaderDescription>
          Craft Spotify Playlists with Ease: Unleash the Power of Flowify's
          Intelligent Workflow Builder – Effortless, Innovative, and Open
          Source.
        </PageHeaderDescription>
        <PageActions>
          <Link
            href={session ? "/workflows" : "/auth/signup"}
            className={cn(buttonVariants())}
          >
            {session ? "My Workflows" : "Get Started"}
          </Link>
        </PageActions>
      </PageHeader>
      <section className="overflow-hidden rounded-lg bg-background shadow-md md:hidden md:shadow-xl"></section>
      <section className="hidden md:block">
        <div className="overflow-hidden rounded-lg bg-background shadow-lg"></div>
      </section>
    </div>
  );
}
