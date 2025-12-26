import * as React from "react";

import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          "relative inline-flex h-5 w-9 items-center",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onCheckedChange?.(event.target.checked)}
          {...props}
        />
        <span
          className={cn(
            "absolute inset-0 rounded-full border border-border/70 bg-muted/70 transition-colors",
            "peer-checked:border-emerald-500/60 peer-checked:bg-emerald-500/70",
            className
          )}
        />
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow-sm transition-transform",
            "peer-checked:translate-x-4"
          )}
        />
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
