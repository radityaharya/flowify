import React from "react";
import * as z from "zod";

import InputPrimitive from "../Primitives/Input";
import NodeBuilder from "../Primitives/NodeBuilder";

const formSchema = z.object({
  artistsId: z.string().min(1, {
    message: "Album ID is required.",
  }),
  limit: z.number().default(10),
  offset: z.number().default(0),
});

const ArtistsTopTracks: React.FC = ({ id, data }: any) => {
  return (
    <NodeBuilder
      id={id}
      data={data}
      title="Artists Top Tracks"
      type="Library"
      info="Get tracks from an artists top tracks."
      formSchema={formSchema}
      handleConnectionType="both"
      formFields={({ form, register }) => (
        <>
          <InputPrimitive
            control={form.control}
            name="artistId"
            inputType={"text"}
            label={"Artist ID"}
            register={register}
            placeholder={"Artist ID"}
            description={"The ID of the artist to get top tracks for"}
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

export default ArtistsTopTracks;
