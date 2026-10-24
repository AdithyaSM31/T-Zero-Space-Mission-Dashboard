"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  Radio,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { classifyOutcome } from "@/lib/mission-metrics";

export function useRemote<T>(path: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState<Date | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let active = true;
    setLoading(true);
    setError("");
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}${path}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            response.status === 429
              ? "The launch provider is rate-limited. Please try again later."
              : "The data source is temporarily unavailable. Please try again."
          );
        const result = await response.json();
        if (!Array.isArray(result))
          throw new Error("The source returned an unexpected response.");
        if (active) {
          setData(result);
          setUpdated(new Date());
        }
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof Error && cause.message.startsWith("The ")
              ? cause.message
              : "The data source is temporarily unavailable. Please try again."
          );
      })
      .finally(() => {
        clearTimeout(timeout);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [path, revision]);
  const retry = useCallback(() => setRevision((value) => value + 1), []);
  return { data, loading, error, updated, retry };
}
export function useFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, {
      scroll: false,
    });
  };
  return {
    params,
    set,
    reset: () => router.replace(pathname, { scroll: false }),
  };
}
export function ExplorerShell({
  title,
  eyebrow,
  description,
  children,
  action,
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <>
      <header className="workspace-topbar">
        <div className="breadcrumb">
          Workspace <ChevronRight size={13} />
          <span>{title}</span>
        </div>
        <a
          className="explorer-source"
          href="https://thespacedevs.com/llapi"
          target="_blank"
          rel="noreferrer"
        >
          The Space Devs <ArrowUpRight size={13} />
        </a>
      </header>
      <div className="dashboard-body explorer-body">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <span className="short-line" />
              {eyebrow}
            </div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {action}
        </div>
        {children}
        <footer className="dashboard-footer">
          <span>
            T–ZERO <span>A little closer to the extraordinary.</span>
          </span>
          <span>
            BUILT FOR THE CURIOUS. <span className="status-dot" />
          </span>
        </footer>
      </div>
    </>
  );
}
export function DataState({
  loading,
  error,
  empty,
  retry,
}: {
  loading: boolean;
  error: string;
  empty: boolean;
  retry: () => void;
}) {
  if (loading)
    return (
      <div className="explorer-loading" role="status">
        <RefreshCw size={22} className="spin" />
        <p>Retrieving the latest data…</p>
      </div>
    );
  if (error || empty)
    return (
      <div className="empty-schedule" role="status">
        <Radio size={24} />
        <p>{error || "No results match these filters."}</p>
        {error && (
          <button className="quiet-button" onClick={retry}>
            Try again <RefreshCw size={14} />
          </button>
        )}
      </div>
    );
  return null;
}
export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setDraft(value);
  }, [value]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  return (
    <label className="explorer-search">
      <Search size={16} />
      <span className="sr-only">{placeholder}</span>
      <input
        value={draft}
        placeholder={placeholder}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => onChange(next), 300);
        }}
      />
      {draft && (
        <button
          aria-label="Clear search"
          onClick={() => {
            if (timer.current) clearTimeout(timer.current);
            setDraft("");
            onChange("");
          }}
        >
          <X size={14} />
        </button>
      )}
    </label>
  );
}
export function SourceNote({
  updated,
  children,
}: {
  updated: Date | null;
  children?: ReactNode;
}) {
  return (
    <div className="source-note">
      <span className="status-dot" />
      <span>
        {children ||
          "Schedule source: The Space Devs. Launch dates can change."}
        {updated && (
          <>
            {" "}
            · Retrieved{" "}
            {updated.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            local
          </>
        )}
      </span>
    </div>
  );
}
export function dateLabel(
  value: string,
  options: Intl.DateTimeFormatOptions = {}
) {
  const time = Date.parse(value);
  return Number.isFinite(time)
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
        ...options,
      }).format(time)
    : "Not provided";
}
export const outcome = classifyOutcome;
export function scheduleDate(launch: {
  net: string;
  net_precision?: { abbrev: string; name: string };
}) {
  const precision = launch.net_precision?.abbrev;
  if (["MIN", "SEC", "HR", "DAY"].includes(precision || ""))
    return dateLabel(launch.net, { year: undefined });
  if (precision === "M") return dateLabel(launch.net, { day: undefined });
  return `${dateLabel(launch.net, { day: undefined, month: undefined })} · ${
    launch.net_precision?.name || "Date estimate"
  }`;
}
export function scheduleTime(launch: {
  net: string;
  net_precision?: { abbrev: string; name: string };
}) {
  return ["MIN", "SEC", "HR"].includes(launch.net_precision?.abbrev || "")
    ? `${dateLabel(launch.net, {
        hour: "2-digit",
        minute: "2-digit",
        day: undefined,
        month: undefined,
        year: undefined,
      })} UTC${launch.net_precision?.abbrev === "HR" ? " (approx.)" : ""}`
    : `${launch.net_precision?.name || "Time"} estimate`;
}
