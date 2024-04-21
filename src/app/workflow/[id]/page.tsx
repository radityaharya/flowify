import Builder from "../Builder";

export default function Page({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) {
  return <Builder params={params} searchParams={searchParams} />;
}
