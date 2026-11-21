import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useContext } from "react";
import { StoreContext } from "../context/StoreContext";

export function ToastContainer() {
  const { toasts, dismissToast } = useContext(StoreContext);

  if (!toasts || toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 border border-zinc-950 bg-zinc-950 text-white p-4 shadow-2xl dark:border-zinc-200 dark:bg-white dark:text-zinc-950 transition-all duration-200"
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 size={16} strokeWidth={2} />}
              {isError && <AlertCircle size={16} strokeWidth={2} />}
              {!isSuccess && !isError && <Info size={16} strokeWidth={2} />}
            </div>

            <div className="min-w-0 flex-1">
              {toast.title && (
                <p className="text-[11px] font-bold uppercase tracking-wider">
                  {toast.title}
                </p>
              )}
              <p className="text-xs leading-relaxed text-zinc-300 dark:text-zinc-600 mt-0.5">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 text-zinc-400 hover:text-white dark:text-zinc-500 dark:hover:text-zinc-950 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </aside>
  );
}
