import Balance from "react-wrap-balancer";
import GradientBackground from "../animatedBackground/GradientsBackground";
import { cn } from "@/lib/utils";

function PageHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section className="mx-auto flex flex-col items-center gap-2 py-12 md:pb-8 lg:py-24 lg:pb-20">
      <div
        className={cn(
          "z-[2] mx-auto flex max-w-[980px] flex-col items-center gap-4 py-12 md:pb-8 lg:py-24 lg:pb-20",
          className,
        )}
        {...props}
      >
        {children}
      </div>
      <div className="absolute left-0 top-0 z-[1] h-full w-full bg-background opacity-70" />
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
        "text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]",
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
        "flex w-full items-center justify-center space-x-4 py-4 md:pb-10",
        className,
      )}
      {...props}
    />
  );
}

export { PageHeader, PageHeaderHeading, PageHeaderDescription, PageActions };
