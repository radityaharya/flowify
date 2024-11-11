import Balance from "react-wrap-balancer";

import { cn } from "@/lib/utils";

import GradientBackground from "../animatedBackground/GradientsBackground";
import BuilderDemo from "./BuilderDemo";

function PageHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section className="mx-auto flex h-full flex-col items-center gap-2 py-12 sm:justify-center lg:py-24">
      <div
        className={cn(
          "z-10 mx-auto flex max-w-[980px] flex-col items-center gap-4 py-12 md:ml-10 md:w-1/3 md:items-start md:py-8 lg:py-24 lg:pb-20",
          className,
        )}
        {...props}
      >
        {children}
      </div>
      <div className="absolute left-0 top-0 z-[1] size-full bg-background opacity-40 blur-sm" />
      <BuilderDemo />
      <GradientBackground />
    </section>
  );
}
function PageHeaderHeading({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-center text-3xl font-bold leading-tight tracking-tighter md:text-start md:text-6xl lg:leading-[1.1]",
        className,
      )}
      {...props}
    />
  );
}

function PageHeaderDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <Balance
      className={cn(
        "max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl",
        className,
      )}
      {...props}
    />
  );
}

function PageActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center space-x-4 py-4 md:items-start md:justify-start md:pb-10",
        className,
      )}
      {...props}
    />
  );
}

export { PageHeader, PageHeaderHeading, PageHeaderDescription, PageActions };
