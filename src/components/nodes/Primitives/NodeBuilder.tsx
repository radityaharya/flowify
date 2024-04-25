import React from "react";
import { Position } from "@xyflow/react";
import NodeHandle from "../Primitives/NodeHandle";
import { CardWithHeader } from "../Primitives/Card";
import Debug from "../Primitives/Debug";
import { Form } from "@/components/ui/form";
import useBasicNodeState from "~/hooks/useBasicNodeState";
import { ZodTypeAny, ZodObject } from "zod";
interface NodeBuilderProps {
  id: string;
  data: any;
  title: string;
  type: string;
  info: string;
  formSchema: ZodObject<any>;
  formFields: (args: { form: any, register: any }) => React.ReactNode;
  extraContent?: React.ReactNode;
  handleConnectionType?: "source" | "target" | "both";
}

const NodeBuilder: React.FC<NodeBuilderProps> = React.memo(
  ({
    id,
    data,
    title,
    type,
    info,
    formSchema,
    formFields,
    extraContent,
    handleConnectionType = "both",
  }) => {
    const {
      state,
      isValid,
      targetConnections,
      sourceConnections,
      form,
      formState,
      register,
      getNodeData,
      updateNodeData,
    } = useBasicNodeState(id, formSchema);

    // Handle data updates from props or form
    React.useEffect(() => {
      if (data) {
        form!.reset(data);
      }
    }, [data, form]);

    const watch = form!.watch();
    const prevWatchRef = React.useRef(watch);
    React.useEffect(() => {
      if (JSON.stringify(prevWatchRef.current) !== JSON.stringify(watch)) {
        updateNodeData(id, {
          ...watch,
        });
      }
      prevWatchRef.current = watch;
    }, [watch, id, updateNodeData]);

    const formValid = formState!.isValid;
    const nodeValid = React.useMemo(() => {
      return formValid && isValid;
    }, [formValid, isValid]);

    return (
      <CardWithHeader
        title={title}
        id={id}
        type={type}
        status={nodeValid ? "success" : "error"}
        info={info}
      >
        {handleConnectionType !== "target" && (
          <NodeHandle
            type="source"
            position={Position.Right}
            style={{ background: "#555" }}
          />
        )}
        {handleConnectionType !== "source" && (
          <NodeHandle
            type="target"
            position={Position.Left}
            style={{ background: "#555" }}
          />
        )}
        {form && formFields && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => console.info(data))}>
              {formFields({ form, register })}
            </form>
          </Form>
        )}
        {extraContent}
        <Debug
          id={id}
          isValid={nodeValid}
          TargetConnections={targetConnections}
          SourceConnections={sourceConnections}
        />
      </CardWithHeader>
    );
  },
);

export default NodeBuilder;
