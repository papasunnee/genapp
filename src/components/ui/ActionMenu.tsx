"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface ActionMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

/**
 * A row-scoped "..." action menu, rendered via a portal at a fixed
 * position computed from the trigger button - a plain absolutely-
 * positioned dropdown would get clipped by the table's own
 * overflow-x-auto wrapper, since a table row can't escape its
 * scroll container's bounds any other way.
 */
export default function ActionMenu({ items }: { items: ActionMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
      }
    };
    updatePosition();

    const onClickOutside = (e: MouseEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };
    const onDismiss = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("scroll", onDismiss, true);
    window.addEventListener("resize", onDismiss);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("scroll", onDismiss, true);
      window.removeEventListener("resize", onDismiss);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open actions menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <i className="fas fa-ellipsis-v"></i>
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: position.top, right: position.right }}
            className="w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50"
          >
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.icon && <i className={`fas ${item.icon} w-4 flex-shrink-0`}></i>}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
