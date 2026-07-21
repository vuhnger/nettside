"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type AccessibleDialogProps = {
  trigger: ReactNode;
  children: ReactNode;
  labelId: string;
  descriptionId?: string;
  triggerClassName?: string;
  dialogClassName?: string;
  animatedTrigger?: boolean;
};

const AccessibleDialog = ({
  trigger,
  children,
  labelId,
  descriptionId,
  triggerClassName,
  dialogClassName,
  animatedTrigger = false,
}: AccessibleDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      document.body.style.overflow = dialog.dataset.previousOverflow ?? "";
      delete dialog.dataset.previousOverflow;
      triggerRef.current?.focus();
    };

    const handleCancel = (event: Event) => {
      event.preventDefault();
      dialog.close();
    };
    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("cancel", handleCancel);
      if (dialog.open) {
        document.body.style.overflow = dialog.dataset.previousOverflow ?? "";
      }
    };
  }, []);

  const openDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.dataset.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeRef.current?.focus();
  };

  const Trigger = animatedTrigger ? motion.button : "button";

  return (
    <>
      <Trigger
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        className={triggerClassName}
        {...(animatedTrigger
          ? { whileHover: { y: -2, boxShadow: "var(--ds-shadow-md)" }, whileTap: { scale: 0.98 } }
          : {})}
      >
        {trigger}
      </Trigger>
      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        className={cn(
          "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto p-0 backdrop:bg-[color:color-mix(in_srgb,var(--ds-color-neutral-base-default)_70%,transparent)] backdrop:backdrop-blur-sm",
          dialogClassName
        )}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="absolute right-4 top-4 z-10 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition border-[color:var(--ds-color-neutral-border-subtle)] text-[color:var(--ds-color-neutral-text-subtle)] hover:border-[color:var(--ds-color-accent-border-default)] hover:text-[color:var(--ds-color-accent-text-default)]"
        >
          Lukk
        </button>
        {children}
      </dialog>
    </>
  );
};

export default AccessibleDialog;
