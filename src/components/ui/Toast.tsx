"use client";

import { useEffect, useState } from "react";

type ToastVariant = "success" | "error";
type ToastItem = { id: number; message: string; variant: ToastVariant };

let seq = 0;
let toasts: ToastItem[] = [];
const listeners = new Set<(items: ToastItem[]) => void>();

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(message: string, variant: ToastVariant) {
  const id = ++seq;
  toasts = [...toasts, { id, message, variant }];
  emit();
  setTimeout(() => dismiss(id), 4000);
}

export const toast = {
  success: (message: string) => push(message, "success"),
  error: (message: string) => push(message, "error"),
};

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg shadow-lg px-4 py-3 text-sm text-white transition-all duration-200 ${
        item.variant === "success" ? "bg-emerald-600" : "bg-red-600"
      } ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
    >
      <i
        className={`fas mt-0.5 ${
          item.variant === "success" ? "fa-check-circle" : "fa-exclamation-circle"
        }`}
      ></i>
      <span className="break-words flex-grow">{item.message}</span>
      <button
        onClick={onDismiss}
        className="text-white/80 hover:text-white leading-none text-lg"
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  );
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>(toasts);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col space-y-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none">
      {items.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <ToastCard item={item} onDismiss={() => dismiss(item.id)} />
        </div>
      ))}
    </div>
  );
}
