"use client"

import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"

export const toast = {
  error: (title: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.error(title, {
      description: options?.description,
      duration: options?.duration,
    });
  },
  success: (title: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.success(title, {
      description: options?.description,
      duration: options?.duration,
    });
  },
  warning: (title: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.warning(title, {
      description: options?.description,
      duration: options?.duration,
    });
  },
  info: (title: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.info(title, {
      description: options?.description,
      duration: options?.duration,
    });
  }
};

export const toaster = toast;

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: "border-border bg-background text-foreground",
      }}
    />
  );
}
