"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";

const NAV_MIN_MS = 320;

type PageLoadingContextValue = {
  startLoading: () => void;
};

const PageLoadingContext = createContext<PageLoadingContextValue | null>(null);

export function usePageLoading() {
  const ctx = useContext(PageLoadingContext);
  if (!ctx) {
    throw new Error("usePageLoading must be used within PageLoadingProvider");
  }
  return ctx;
}

function shouldStartLoadingForAnchor(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }
  if (href.startsWith("/api/")) {
    return false;
  }
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const url = new URL(href);
      if (url.origin !== window.location.origin) {
        return false;
      }
    } catch {
      return false;
    }
  }
  return true;
}

async function waitForPageReady() {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function PageLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const [initialLoading, setInitialLoading] = useState(true);
  const [navLoading, setNavLoading] = useState(false);
  const navStartedAt = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const startLoading = useCallback(() => {
    clearHideTimer();
    navStartedAt.current = Date.now();
    setNavLoading(true);
  }, [clearHideTimer]);

  const finishNavLoading = useCallback(async () => {
    await waitForPageReady();
    const elapsed = Date.now() - navStartedAt.current;
    const delay = Math.max(0, NAV_MIN_MS - elapsed);

    clearHideTimer();
    hideTimer.current = setTimeout(() => {
      setNavLoading(false);
      hideTimer.current = null;
    }, delay);
  }, [clearHideTimer]);

  useEffect(() => {
    let cancelled = false;

    async function finishInitialLoad() {
      if (document.readyState !== "complete") {
        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => resolve(), { once: true });
        });
      }
      await waitForPageReady();
      if (!cancelled) {
        setInitialLoading(false);
      }
    }

    finishInitialLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (initialLoading) {
      return;
    }
    if (navLoading) {
      void finishNavLoading();
    }
  }, [routeKey, initialLoading, navLoading, finishNavLoading]);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");
      if (!anchor || !shouldStartLoadingForAnchor(anchor)) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (href) {
        try {
          const nextUrl = new URL(href, window.location.origin);
          const current = `${window.location.pathname}${window.location.search}`;
          const next = `${nextUrl.pathname}${nextUrl.search}`;
          if (next === current) {
            return;
          }
        } catch {
          return;
        }
      }

      startLoading();
    }

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [startLoading]);

  useEffect(() => {
    return () => clearHideTimer();
  }, [clearHideTimer]);

  const visible = initialLoading || navLoading;

  useEffect(() => {
    document.body.classList.toggle("page-is-loading", visible);
    return () => document.body.classList.remove("page-is-loading");
  }, [visible]);

  return (
    <PageLoadingContext.Provider value={{ startLoading }}>
      <PageLoadingOverlay visible={visible} />
      {children}
    </PageLoadingContext.Provider>
  );
}
