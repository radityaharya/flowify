import React from "react";
import * as z from "zod";
import InputPrimitive from "../Primitives/Input";
import NodeBuilder from "../Primitives/NodeBuilder";

const formSchema = z.object({
  albumId: z.string().min(1, {
    message: "Album ID is required.",
  }),
  limit: z.number().default(10),
  offset: z.number().default(0),
});

const AlbumTracks: React.FC = ({ id, data }: any) => {
  return (
    <NodeBuilder
      id={id}
      data={data}
      title="Album Tracks"
      type="Library"
      info="Get tracks from an album"
      formSchema={formSchema}
      handleConnectionType="both"
      formFields={({ form, register }) => (
        <>
          <InputPrimitive
            control={form.control}
            name="albumId"
            inputType={"text"}
            label={"Album ID"}
            register={register}
            placeholder={"Album ID"}
            description={"The ID of the album to sort by popularity"}
          />
          <InputPrimitive
            control={form.control}
            name="limit"
            inputType={"number"}
            label={"Limit"}
            register={register}
            placeholder={"10"}
            description={"The number of tracks to return"}
          />
          <InputPrimitive
            control={form.control}
            name="offset"
            inputType={"number"}
            label={"Offset"}
            register={register}
            placeholder={"0"}
            description={"The offset to start at"}
            />
        </>
      )}
    />
  );
};

export default AlbumTracks;
