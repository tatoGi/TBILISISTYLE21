"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function hasNextActionHeader(
  input: RequestInfo | URL,
  init?: RequestInit,
): boolean {
  if (init?.headers) {
    const headers = new Headers(init.headers);
    if (headers.has("Next-Action")) return true;
  }
  if (typeof input === "object" && "headers" in input) {
    const reqHeaders = input.headers;
    if (reqHeaders instanceof Headers && reqHeaders.has("Next-Action")) {
      return true;
    }
  }
  return false;
}

function isTrackedRequest(input: RequestInfo | URL, init?: RequestInit): boolean {
  const url = resolveUrl(input);
  if (url.includes("/payload-api")) return true;
  if (hasNextActionHeader(input, init)) return true;
  return false;
}

function isLoginRequest(url: string): boolean {
  return /\/users\/login|\/login\b/i.test(url);
}

export default function AdminLoadingProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const [pending, setPending] = useState(0);
  const [overlayText, setOverlayText] = useState<string | null>(null);
  const pendingRef = useRef(0);

  const begin = useCallback((url: string) => {
    pendingRef.current += 1;
    setPending(pendingRef.current);

    if (pathname?.includes("/login") && isLoginRequest(url)) {
      setOverlayText("შესვლა მიმდინარეობს…");
    }
  }, [pathname]);

  const end = useCallback(() => {
    pendingRef.current = Math.max(0, pendingRef.current - 1);
    setPending(pendingRef.current);
    if (pendingRef.current === 0) {
      setOverlayText(null);
    }
  }, []);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init) => {
      if (!isTrackedRequest(input, init)) {
        return originalFetch(input, init);
      }

      const url = resolveUrl(input);
      begin(url);

      try {
        return await originalFetch(input, init);
      } finally {
        end();
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [begin, end]);

  const onLoginPage = pathname?.includes("/login") ?? false;
  const showOverlay = onLoginPage && pending > 0 && overlayText !== null;
  const showBar = pending > 0;

  return (
    <>
      {showBar ? (
        <div
          aria-hidden="true"
          className="ts21-api-loading-bar"
          role="presentation"
        >
          <div className="ts21-api-loading-bar__track" />
        </div>
      ) : null}

      {showOverlay ? (
        <div
          aria-busy="true"
          aria-live="polite"
          className="ts21-admin-loading-overlay"
          role="status"
        >
          <div className="ts21-admin-loading-overlay__panel">
            <div className="ts21-admin-loading-overlay__spinner" />
            <p className="ts21-admin-loading-overlay__text">{overlayText}</p>
          </div>
        </div>
      ) : null}

      {children}
    </>
  );
}
