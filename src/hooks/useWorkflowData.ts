import { fetcher } from "@/app/utils/fetcher";
import useSWR from "swr";

export function useWorkflowData(flowId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    flowId ? `/api/workflow/${flowId}` : null,
    fetcher,
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
