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
            className="pointer-events-auto flex items-start gap-3 border border-black bg-black text-white p-4 shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="mt-0.5 shrink-0 text-white">
              {isSuccess && <CheckCircle2 size={16} strokeWidth={2} />}
              {isError && <AlertCircle size={16} strokeWidth={2} />}
              {!isSuccess && !isError && <Info size={16} strokeWidth={2} />}
            </div>

            <div className="min-w-0 flex-1">
              {toast.title && (
                <p className="text-[11px] font-bold uppercase tracking-wider text-white">
                  {toast.title}
                </p>
              )}
              <p className="text-xs leading-relaxed text-neutral-300 mt-0.5">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </aside>
  );
}
