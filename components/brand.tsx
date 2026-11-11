import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-[#75a2ff] via-[#4f7cff] to-[#7c5cff] text-white shadow-[0_6px_20px_rgba(70,110,255,0.28)]",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-[62%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.8 4.9c-.7-.3-1.4.4-1.1 1.1l4.7 12.1c.3.8 1.4.8 1.8.1l2.4-4.6 4.9-2.3c.9-.4.9-1.6 0-1.9L5.8 4.9Z"
          fill="currentColor"
        />
        <path
          d="m12.1 13.6 3 3c.5.5 1.3.5 1.8 0s.5-1.3 0-1.8l-3-3"
          stroke="#2647ad"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Brand({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark className={compact ? "size-7 rounded-lg" : "size-8"} />
      <span
        className={cn(
          "font-semibold tracking-[-0.03em] text-white",
          compact ? "text-[13px]" : "text-[15px]",
        )}
      >
        Visual HTML Editor<span className="text-[#6f9aff]">.</span>
      </span>
    </div>
  );
}
