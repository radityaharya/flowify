import useSWR from "swr";
import { fetcher } from "@/app/utils/fetcher";

export function useWorkflowData(flowId: string) {
  return useSWR(flowId ? `/api/workflow/${flowId}` : null, fetcher) as {
    data: WorkflowResponse;
    error: {
      status: number;
      info: string;
    };
    isLoading: boolean;
  };
}
