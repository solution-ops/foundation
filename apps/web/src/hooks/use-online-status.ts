import { useEffect, useRef } from "react";
import { toast } from "sonner";

const OFFLINE_TOAST_ID = "offline-status";

/**
 * Shows a persistent toast when the browser goes offline and
 * dismisses it (with a success toast) when connectivity returns.
 *
 * Mount once near the app root — e.g. inside the auth layout.
 */
export function useOnlineStatus() {
  const wasOffline = useRef(false);

  useEffect(() => {
    function handleOffline() {
      wasOffline.current = true;
      toast.error("You're offline", {
        id: OFFLINE_TOAST_ID,
        description: "Changes won't be saved until you reconnect.",
        duration: Number.POSITIVE_INFINITY,
      });
    }

    function handleOnline() {
      toast.dismiss(OFFLINE_TOAST_ID);
      if (wasOffline.current) {
        wasOffline.current = false;
        toast.success("Back online");
      }
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // If already offline on mount, show immediately
    if (!navigator.onLine) handleOffline();

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
}
