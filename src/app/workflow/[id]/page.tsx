import Builder from "../Builder";

type Params = Promise<{ id: string; [key: string]: any }>;
type SearchParams = Promise<{ [key: string]: any }>;

export default async function Page(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  return <Builder params={params} searchParams={searchParams} />;
}
