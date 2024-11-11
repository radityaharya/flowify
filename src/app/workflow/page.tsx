import { use } from "react";

import Builder from "./Builder";

type Params = Promise<{ id: string; [key: string]: any }>;
type SearchParams = Promise<{ [key: string]: any }>;

export default function Page(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);

  return <Builder params={params} searchParams={searchParams} />;
}
