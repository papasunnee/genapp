"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmState = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

let listener: ((state: ConfirmState | null) => void) | null = null;

export function confirmDialog(options: ConfirmOptions | string): Promise<boolean> {
  const opts: ConfirmOptions = typeof options === "string" ? { message: options } : options;
  return new Promise((resolve) => {
    listener?.({ ...opts, resolve });
  });
}

export function ConfirmDialogHost() {
  const [state, setState] = useState<ConfirmState | null>(null);

  useEffect(() => {
    listener = setState;
    return () => {
      listener = null;
    };
  }, []);

  const close = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <Modal
      open={state !== null}
      title={state?.title ?? "Please confirm"}
      onClose={() => close(false)}
      size="sm"
    >
      {state && (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">{state.message}</p>
          <div className="flex justify-end space-x-3 pt-2 border-t">
            <button
              onClick={() => close(false)}
              className="px-4 py-2 rounded text-sm border text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {state.cancelLabel ?? "Cancel"}
            </button>
            <button
              onClick={() => close(true)}
              className={`px-4 py-2 rounded text-sm text-white transition-colors ${
                state.danger === false
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {state.confirmLabel ?? "Confirm"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
