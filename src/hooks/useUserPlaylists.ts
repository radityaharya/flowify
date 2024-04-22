import { useEffect, useState } from "react";

export function useUserPlaylists(search?: string) {
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const url = search
          ? `/api/user/@me/playlists?q=${search}`
          : `/api/user/@me/playlists`;

        const response = await fetch(url);
        const data = await response.json();

        setPlaylists(data as any[]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlaylists();
  }, [search]);

  return playlists;
}
