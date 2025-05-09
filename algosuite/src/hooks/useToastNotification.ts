/**
 * useToastNotification.ts
 * Reusable toast notification hook for Shadcn UI.
 * Author: aiGI Auto-Coder
 */

import { toast } from "../components/ui/toaster";
import { useCallback } from "react";

/**
 * Provides a simple API for showing success, error, or info toasts.
 */
export function useToastNotification() {
  const notify = useCallback(
    (
      options: {
        title: string;
        description?: string;
        status?: "success" | "error" | "warning" | "info";
        duration?: number;
        isClosable?: boolean;
      }
    ) => {
      const { status = "info", duration = 4000 } = options;

      if (status === "error") {
        toast.error(options.title, {
          description: options.description,
          duration: duration,
        });
      } else if (status === "success") {
        toast.success(options.title, {
          description: options.description,
          duration: duration,
        });
      } else if (status === "warning") {
        toast.warning(options.title, {
          description: options.description,
          duration: duration,
        });
      } else {
        toast.info(options.title, {
          description: options.description,
          duration: duration,
        });
      }
    },
    []
  );

  return notify;
}