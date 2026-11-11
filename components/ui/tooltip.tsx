"use client";

import {
  cloneElement,
  isValidElement,
  useState,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: ReactNode;
  shortcut?: string;
  side?: "top" | "bottom" | "left" | "right";
  children: ReactElement;
  delay?: number;
}

export function Tooltip({
  content,
  shortcut,
  side = "bottom",
  children,
  delay = 250,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  function show() {
    timeoutRef.current = window.setTimeout(() => {
      setVisible(true);
    }, delay);
  }

  function hide() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  }

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  if (!isValidElement(children)) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      {cloneElement(children as ReactElement<{ onKeyDown?: (e: React.KeyboardEvent) => void }>, {
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Escape") hide();
        },
      })}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-[220] flex items-center gap-1.5 whitespace-nowrap rounded-md border border-white/10 bg-[#141418] px-2 py-1 text-[10.5px] font-medium text-zinc-200 shadow-xl backdrop-blur-md transition-opacity animate-fade-in",
            sideClasses[side],
          )}
        >
          <span>{content}</span>
          {shortcut ? (
            <kbd className="rounded border border-white/15 bg-white/10 px-1 py-0.2 font-mono text-[9px] text-zinc-300">
              {shortcut}
            </kbd>
          ) : null}
        </div>
      )}
    </div>
  );
}
