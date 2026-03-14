"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error("Sheet components must be used within Sheet");
  return context;
}

type SheetProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function Sheet({ children, open: openProp, onOpenChange }: SheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;

  const setOpen = React.useCallback<React.Dispatch<React.SetStateAction<boolean>>>(
    (value) => {
      const nextValue = typeof value === "function" ? value(open) : value;
      if (openProp === undefined) {
        setInternalOpen(nextValue);
      }
      onOpenChange?.(nextValue);
    },
    [open, openProp, onOpenChange],
  );

  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

type ClickableChild = React.ReactElement<{
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  type?: string;
}>;

function SheetTrigger({ children, asChild = false }: { children: ClickableChild; asChild?: boolean }) {
  const { setOpen } = useSheetContext();

  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);
      setOpen(true);
    },
    ...(asChild ? {} : { type: "button" }),
  });
}

function SheetClose({ children, asChild = false }: { children: ClickableChild; asChild?: boolean }) {
  const { setOpen } = useSheetContext();

  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);
      setOpen(false);
    },
    ...(asChild ? {} : { type: "button" }),
  });
}

function SheetContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, setOpen } = useSheetContext();

  if (!open) return null;

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-72 bg-white p-4 shadow-xl", className)}>{children}</aside>
    </>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-gray-900", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle };
