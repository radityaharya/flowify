import Image from "next/image";

export function PlaylistItem(props: any) {
  return (
    <div className="flex items-center gap-2">
      <Image
        className="h-8 w-8 rounded-sm"
        src={props.playlist.image ?? "/images/spotify.png"}
        alt=""
        width={32}
        height={32}
        unoptimized
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{props.playlist.name}</span>
        <span className="text-xs text-gray-400">
          {props.playlist.owner} - {props.playlist.total} tracks
        </span>
      </div>
    </div>
  );
}
