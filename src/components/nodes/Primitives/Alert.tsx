import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function AlertComponent({
  variant,
  title,
  description,
}: {
  variant: "default" | "destructive";
  title: string;
  description: string;
}) {
  return (
    <Alert variant={variant}>
      {variant === "default" ? (
        <Info className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle className="font-bold">{title}</AlertTitle>
      <AlertDescription className="font-base">{description}</AlertDescription>
    </Alert>
  );
}
