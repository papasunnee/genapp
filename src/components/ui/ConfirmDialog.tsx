"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  /**
   * When set, the confirm button stays disabled until the user types this
   * exact text into a field - extra friction for actions destructive enough
   * that a single click shouldn't be able to trigger them (e.g. deleting an
   * organization and all of its data).
   */
  confirmText?: string;
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
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    listener = (next) => {
      setTypedText("");
      setState(next);
    };
    return () => {
      listener = null;
    };
  }, []);

  const close = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  const confirmDisabled = !!state?.confirmText && typedText !== state.confirmText;

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
          {state.confirmText && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Type <span className="font-mono font-semibold text-slate-700">{state.confirmText}</span> to
                confirm
              </label>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors"
              />
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-2 border-t">
            <button
              onClick={() => close(false)}
              className="px-4 py-2 rounded text-sm border text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {state.cancelLabel ?? "Cancel"}
            </button>
            <button
              onClick={() => close(true)}
              disabled={confirmDisabled}
              className={`px-4 py-2 rounded text-sm text-white transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed ${
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
