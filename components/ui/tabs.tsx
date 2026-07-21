"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  getTriggerId: (value: string) => string;
  getPanelId: (value: string) => string;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

const toIdPart = (value: string) => encodeURIComponent(value).replaceAll("%", "-");

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = ({ value, defaultValue, onValueChange, className, ...props }: TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const baseId = React.useId();
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider
      value={{
        value: currentValue,
        setValue,
        getTriggerId: (tabValue) => `${baseId}-trigger-${toIdPart(tabValue)}`,
        getPanelId: (tabValue) => `${baseId}-panel-${toIdPart(tabValue)}`,
      }}
    >
      <div className={cn("flex flex-col gap-2", className)} {...props} />
    </TabsContext.Provider>
  );
};

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, orientation = "horizontal", onKeyDown, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsList must be used within Tabs");

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      const isPrevious =
        event.key === "Home" ||
        (orientation === "horizontal" ? event.key === "ArrowLeft" : event.key === "ArrowUp");
      const isNext =
        event.key === "End" ||
        (orientation === "horizontal" ? event.key === "ArrowRight" : event.key === "ArrowDown");
      if (!isPrevious && !isNext) return;

      const tabs = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')
      );
      if (!tabs.length) return;

      event.preventDefault();
      const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
      let nextIndex: number;
      if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else if (isPrevious) nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      else nextIndex = (currentIndex + 1) % tabs.length;

      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-lg border border-border/60 bg-muted/50 p-1 text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, onClick, id, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) {
      throw new Error("TabsTrigger must be used within Tabs");
    }

    const isActive = context.value === value;
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        context.setValue(value);
      }
    };

    return (
      <button
        ref={ref}
        id={id ?? context.getTriggerId(value)}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={context.getPanelId(value)}
        tabIndex={isActive ? 0 : -1}
        data-state={isActive ? "active" : "inactive"}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] transition",
          "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
          className
        )}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, id, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");
    const isActive = context.value === value;

    return (
      <div
        ref={ref}
        id={id ?? context.getPanelId(value)}
        role="tabpanel"
        aria-labelledby={context.getTriggerId(value)}
        tabIndex={0}
        hidden={!isActive}
        className={cn("mt-2", className)}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
