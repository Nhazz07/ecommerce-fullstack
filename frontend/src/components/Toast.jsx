import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useContext } from "react";
import { StoreContext } from "../context/StoreContext";

export function ToastContainer() {
  const { toasts, dismissToast } = useContext(StoreContext);

  if (!toasts || toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 bg-zinc-950/95 border-zinc-800 text-zinc-100 dark:border-zinc-800 dark:bg-zinc-950/95 shadow-black/40"
            style={{
              borderColor: isSuccess ? "rgba(197, 168, 128, 0.4)" : isError ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 255, 255, 0.15)",
            }}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 size={17} className="text-[#dfc79b]" />}
              {isError && <AlertCircle size={17} className="text-red-400" />}
              {!isSuccess && !isError && <Info size={17} className="text-zinc-400" />}
            </div>

            <div className="min-w-0 flex-1">
              {toast.title && (
                <p className="text-xs font-semibold uppercase tracking-wider text-[#dfc79b]">
                  {toast.title}
                </p>
              )}
              <p className="text-xs leading-relaxed text-zinc-300 mt-0.5">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </aside>
  );
}
