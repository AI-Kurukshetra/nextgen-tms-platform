"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TooltipContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error("Tooltip components must be used within Tooltip");
  return context;
}

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <TooltipContext.Provider value={{ open, setOpen }}>{children}</TooltipContext.Provider>;
}

type HoverableChild = React.ReactElement<{
  onMouseEnter?: (event: React.MouseEvent<Element>) => void;
  onMouseLeave?: (event: React.MouseEvent<Element>) => void;
  onFocus?: (event: React.FocusEvent<Element>) => void;
  onBlur?: (event: React.FocusEvent<Element>) => void;
  type?: string;
}>;

function TooltipTrigger({ children, asChild = false }: { children: HoverableChild; asChild?: boolean }) {
  const { setOpen } = useTooltipContext();

  return React.cloneElement(children, {
    onMouseEnter: (event: React.MouseEvent) => {
      children.props.onMouseEnter?.(event);
      setOpen(true);
    },
    onMouseLeave: (event: React.MouseEvent) => {
      children.props.onMouseLeave?.(event);
      setOpen(false);
    },
    onFocus: (event: React.FocusEvent) => {
      children.props.onFocus?.(event);
      setOpen(true);
    },
    onBlur: (event: React.FocusEvent) => {
      children.props.onBlur?.(event);
      setOpen(false);
    },
    ...(asChild ? {} : { type: "button" }),
  });
}

function TooltipContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = useTooltipContext();
  if (!open) return null;

  return (
    <div className={cn("absolute z-50 mt-2 w-56 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg", className)}>
      {children}
    </div>
  );
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
