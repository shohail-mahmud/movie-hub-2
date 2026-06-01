import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  pages.push(1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export default function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);
  const baseBtn =
    "inline-flex h-11 min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-semibold transition select-none";

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
    >
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className={cn(
          baseBtn,
          "px-5 bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-900",
        )}
      >
        Prev
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-1 text-neutral-500">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              baseBtn,
              p === page
                ? "bg-[#f97316] text-black shadow-[0_0_20px_rgba(249,115,22,0.45)]"
                : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className={cn(
          baseBtn,
          "px-5 bg-[#f97316] text-black hover:bg-orange-400",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#f97316]",
        )}
      >
        Next
      </button>
    </nav>
  );
}
