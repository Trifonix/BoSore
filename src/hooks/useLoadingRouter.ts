"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePageLoading } from "@/components/layout/PageLoadingProvider";

type NavigateOptions = Parameters<ReturnType<typeof useRouter>["push"]>[1];

export function useLoadingRouter() {
  const router = useRouter();
  const { startLoading } = usePageLoading();

  return useMemo(
    () => ({
      push: (href: string, options?: NavigateOptions) => {
        startLoading();
        return router.push(href, options);
      },
      replace: (href: string, options?: NavigateOptions) => {
        startLoading();
        return router.replace(href, options);
      },
      refresh: router.refresh,
      back: () => {
        startLoading();
        router.back();
      },
      forward: () => {
        startLoading();
        router.forward();
      },
      prefetch: router.prefetch,
    }),
    [router, startLoading],
  );
}
