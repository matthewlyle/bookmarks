import { friendlyDate } from "@/lib/utils";

interface BookmarkContentProps {
  url: string;
  host: string;
  title: string;
  image?: string | null;
  createdAt: string;
}

export default function BookmarkContent({
  url,
  host,
  title,
  image,
  createdAt,
}: BookmarkContentProps) {
  return (
    <div className="w-full py-3 px-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        draggable="false"
        className="flex items-start justify-between w-full gap-4 no-underline text-inherit select-none"
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="flex gap-3 flex-1 min-w-0">
          {image && (
            <img
              src={image}
              alt={`${host} favicon`}
              className="w-6 h-6 flex-shrink-0"
              draggable="false"
            />
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <p
              className="font-bold text-sm text-primary truncate transition-colors duration-200 ease px-1 -mx-1"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {title}
            </p>
            <div className="flex items-center gap-2 text-xs text-foreground">
              <span>{host}</span>
              <span>·</span>
              <span>{friendlyDate(createdAt)}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
