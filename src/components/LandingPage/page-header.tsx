import { cn } from "@/lib/utils";
import Balance from "react-wrap-balancer";
import GradientBackground from "../animatedBackground/GradientsBackground";
import BuilderDemo from "./BuilderDemo";

function PageHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section className="mx-auto h-full sm:justify-center flex flex-col items-center gap-2 py-12 lg:py-24">
      <div
        className={cn(
          "z-[10] mx-auto flex max-w-[980px] flex-col items-center md:items-start gap-4 py-12 lg:py-24 lg:pb-20 md:py-8 md:w-1/3 md:ml-10",
          className,
        )}
        {...props}
      >
        {children}
      </div>
      <div className="absolute top-0 left-0 z-[1] h-full w-full bg-background opacity-40 blur-sm" />
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
        "text-center md:text-start font-bold text-3xl leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]",
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
        "flex w-full items-center md:items-start justify-center md:justify-start space-x-4 py-4 md:pb-10",
        className,
      )}
      {...props}
    />
  );
}

export { PageHeader, PageHeaderHeading, PageHeaderDescription, PageActions };
