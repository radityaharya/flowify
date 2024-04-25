import React from "react";
import NodeBuilder from "../Primitives/NodeBuilder";
import * as z from "zod";
import InputPrimitive from "../Primitives/Input";

const formSchema = z.object({
  sortOrder: z
    .string()
    .min(1, {
      message: "Operation is required.",
    })
    .default("desc"),
  sortKey: z.string().default("popularity"),
});

const sortOptions = [
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
];

const SortPopularity: React.FC = ({ id, data }: any) => {
  return (
    <NodeBuilder
      id={id}
      data={data}
      title="Sort by Popularity"
      type="Order"
      info="Sorts tracks based on their popularity"
      formSchema={formSchema}
      handleConnectionType="both"
      formFields={({ form, register }) => (
        <>
          <InputPrimitive
            control={form.control}
            name="sortOrder"
            inputType={"select"}
            label={"Sort Order"}
            placeholder={
              form.watch().sortOrder
                ? sortOptions.find(
                    (option) => option.value === form.watch().sortOrder,
                  )!.label
                : "Descending"
            }
            selectOptions={sortOptions}
            register={register}
            description={`The order to sort the results by`}
          />
        </>
      )}
    />
  );
};

export default SortPopularity;
