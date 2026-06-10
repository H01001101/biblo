import Link from "next/link";
import { formatAvg } from "@/lib/queries";
import { NoImageIcon } from "@/components/icons";

export default function ItemCard({
  id,
  name,
  image,
  typeName,
  avg,
}: {
  id: string;
  name: string;
  image: string;
  typeName: string;
  avg: number | null;
}) {
  return (
    <Link
      href={`/item/${id}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-[var(--color-surface-2)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-[var(--color-muted)]/50">
            <NoImageIcon />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="badge w-fit">{typeName}</span>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{name}</h3>
        <div className="mt-auto flex items-center gap-1 pt-1 text-sm text-[var(--color-muted)]">
          <span className="text-amber-500">★</span>
          <span className="font-medium text-[var(--color-ink)]">
            {formatAvg(avg)}
          </span>
          {avg == null && <span className="text-xs">(non noté)</span>}
        </div>
      </div>
    </Link>
  );
}
