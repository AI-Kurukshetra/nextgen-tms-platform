"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type DropdownContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("Dropdown components must be used within DropdownMenu");
  return context;
}

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return <DropdownContext.Provider value={{ open, setOpen }}>{children}</DropdownContext.Provider>;
}

type ClickableChild = React.ReactElement<{
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  type?: string;
}>;

function DropdownMenuTrigger({ children, asChild = false }: { children: ClickableChild; asChild?: boolean }) {
  const { setOpen } = useDropdownContext();

  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);
      setOpen((prev) => !prev);
    },
    ...(asChild ? {} : { type: "button" }),
  });
}

function DropdownMenuContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, setOpen } = useDropdownContext();

  if (!open) return null;

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 cursor-default bg-transparent" onClick={() => setOpen(false)} />
      <div className={cn("absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-200 bg-white p-1 shadow-lg", className)}>
        {children}
      </div>
    </>
  );
}

function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 py-1.5 text-sm font-semibold text-gray-800", className)} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-1 h-px bg-gray-200", className)} {...props} />;
}

function DropdownMenuItem({ className, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDropdownContext();

  return (
    <button
      type="button"
      className={cn("flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100", className)}
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
};
