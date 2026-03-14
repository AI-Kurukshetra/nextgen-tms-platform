"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shouldTrackClick(event: MouseEvent, currentRoute: string) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  const target = event.target as HTMLElement | null;
  const anchor = target?.closest("a");
  if (!anchor) return false;
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return false;

  let nextUrl: URL;
  try {
    nextUrl = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  if (nextUrl.origin !== window.location.origin) return false;

  const nextRoute = `${nextUrl.pathname}${nextUrl.search}`;
  return nextRoute !== currentRoute;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRoute = useMemo(
    () => `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
    [pathname, searchParams]
  );
  const previousRouteRef = useRef(currentRoute);
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!shouldTrackClick(event, currentRoute)) return;
      setActive(true);
      setProgress((prev) => (prev > 10 ? prev : 12));
    };

    const onPopState = () => {
      setActive(true);
      setProgress((prev) => (prev > 10 ? prev : 12));
    };

    const onSubmit = (event: SubmitEvent) => {
      if (event.defaultPrevented) return;

      const form = event.target as HTMLFormElement | null;
      if (!form) return;

      const method = (form.getAttribute("method") ?? "get").toLowerCase();
      if (method !== "get") return;

      setActive(true);
      setProgress((prev) => (prev > 10 ? prev : 12));
    };

    window.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("submit", onSubmit, true);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("submit", onSubmit, true);
    };
  }, [currentRoute]);

  useEffect(() => {
    if (!active) return;

    const safetyReset = window.setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 8000);

    const interval = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 90) return value;
        const step = Math.max(1.5, (90 - value) / 6);
        return Math.min(90, value + step);
      });
    }, 130);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(safetyReset);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    if (previousRouteRef.current === currentRoute) return;

    previousRouteRef.current = currentRoute;
    const complete = window.setTimeout(() => {
      setProgress(100);
    }, 0);
    const reset = window.setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 220);

    return () => {
      window.clearTimeout(complete);
      window.clearTimeout(reset);
    };
  }, [currentRoute, active]);

  useEffect(() => {
    if (active) return;
    previousRouteRef.current = currentRoute;
  }, [currentRoute, active]);

  return (
    <div className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 transition-opacity duration-200 ${active || progress > 0 ? "opacity-100" : "opacity-0"}`}>
      <div
        className="h-full origin-left bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-transform duration-200"
        style={{ transform: `scaleX(${Math.max(progress, 0.02) / 100})` }}
      />
    </div>
  );
}
