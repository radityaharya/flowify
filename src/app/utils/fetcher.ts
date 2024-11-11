export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = {
      status: res.status,
      info: "An error occurred while fetching the data.",
    };
    const json = await res.json();
    error.info = json.error;
    console.info(error);
    throw new Error(error.info);
  }

  return res.json();
};
