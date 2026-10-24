"use client";
import { Suspense, useState } from "react";
import {
  Bookmark,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { hasCalendarDay } from "@/lib/mission-metrics";
import type { Launch } from "@/lib/api";
import {
  DataState,
  ExplorerShell,
  SearchField,
  SourceNote,
  dateLabel,
  scheduleDate,
  scheduleTime,
  useFilters,
  useRemote,
} from "@/components/ExplorerKit";
import { MissionBrief, useSavedMissions } from "@/components/MissionBrief";
function Content() {
  const { data, loading, error, retry, updated } = useRemote<Launch>(
    "/api/launches/upcoming?limit=100"
  );
  const { params, set, reset } = useFilters();
  const { saved, toggle } = useSavedMissions();
  const [selected, setSelected] = useState<Launch | null>(null);
  const query = params.get("q") || "";
  const agency = params.get("agency") || "";
  const status = params.get("status") || "";
  const view = params.get("view") === "calendar" ? "calendar" : "list";
  const savedOnly = params.get("saved") === "1";
  const agencies = [
    ...new Set(data.map((item) => item.launch_service_provider.name)),
  ].sort();
  const filtered = data.filter(
    (item) =>
      (!query ||
        `${item.name} ${item.pad.location.name} ${item.rocket.configuration.name}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!agency || item.launch_service_provider.name === agency) &&
      (!status || item.status.abbrev === status) &&
      (!savedOnly || saved.includes(item.id))
  );
  const today = new Date();
  const monthParam = params.get("month") || "";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam)
    ? new Date(`${monthParam}-01T00:00:00Z`)
    : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const year = month.getUTCFullYear(),
    monthIndex = month.getUTCMonth();
  const dayCount = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const offset = (month.getUTCDay() + 6) % 7;
  const moveMonth = (delta: number) => {
    const date = new Date(Date.UTC(year, monthIndex + delta, 1));
    set("month", date.toISOString().slice(0, 7));
  };
  return (
    <ExplorerShell
      title="Launch Center"
      eyebrow="THE NEXT CHAPTER STARTS HERE"
      description="Follow the missions taking humanity a little further."
      action={
        <button className="quiet-button" onClick={retry} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          Refresh
        </button>
      }
    >
      <div className="explorer-hero launch-hero">
        <div>
          <span className="eyebrow">A WORLD IN MOTION</span>
          <h2>
            Something extraordinary
            <br />
            is always on the horizon.
          </h2>
          <p>Discover upcoming missions across the globe.</p>
        </div>
        <div className="hero-orbit">
          <span />
          <RocketMark />
        </div>
      </div>
      <div className="filter-toolbar">
        <SearchField
          value={query}
          onChange={(value) => set("q", value)}
          placeholder="Search missions, vehicles, or launch sites"
        />
        <label className="sr-only" htmlFor="launch-agency">
          Launch provider
        </label>
        <select
          id="launch-agency"
          value={agency}
          onChange={(event) => set("agency", event.target.value)}
        >
          <option value="">All providers</option>
          {agencies.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="launch-status">
          Launch status
        </label>
        <select
          id="launch-status"
          value={status}
          onChange={(event) => set("status", event.target.value)}
        >
          <option value="">All statuses</option>
          {[...new Set(data.map((item) => item.status.abbrev))].map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
        <button
          className={`filter-toggle ${savedOnly ? "active" : ""}`}
          aria-pressed={savedOnly}
          onClick={() => set("saved", savedOnly ? "" : "1")}
        >
          <Bookmark size={15} />
          Saved
        </button>
        <div className="view-switch">
          <button
            aria-label="List view"
            aria-pressed={view === "list"}
            className={view === "list" ? "active" : ""}
            onClick={() => set("view", "")}
          >
            <List size={16} />
          </button>
          <button
            aria-label="Calendar view"
            aria-pressed={view === "calendar"}
            className={view === "calendar" ? "active" : ""}
            onClick={() => set("view", "calendar")}
          >
            <CalendarDays size={16} />
          </button>
        </div>
      </div>
      <div className="results-caption">
        <span>
          {loading
            ? "Retrieving missions…"
            : `${filtered.length} missions in this schedule`}{" "}
          · All times UTC
        </span>
        {(query || agency || status || savedOnly) && (
          <button onClick={reset}>Clear filters</button>
        )}
      </div>
      <DataState
        loading={loading}
        error={error}
        empty={!filtered.length}
        retry={retry}
      />
      {!loading &&
        !error &&
        filtered.length > 0 &&
        (view === "list" ? (
          <div className="launch-list">
            {filtered.map((launch, index) => (
              <button
                key={launch.id}
                className="launch-row"
                onClick={() => setSelected(launch)}
              >
                <span className="row-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="row-date">
                  <strong>{scheduleDate(launch)}</strong>
                  <small>{scheduleTime(launch)}</small>
                </span>
                <span className="row-mission">
                  <span className="eyebrow">
                    {launch.launch_service_provider.name}
                  </span>
                  <strong>{launch.mission?.name || launch.name}</strong>
                  <small>{launch.rocket.configuration.name}</small>
                </span>
                <span className="row-location">
                  <MapPin size={13} />
                  {launch.pad.location.name}
                </span>
                <span className="outcome-badge">{launch.status.abbrev}</span>
                {saved.includes(launch.id) ? (
                  <Bookmark size={15} className="mint" />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="calendar-panel">
            <header>
              <div>
                <span className="eyebrow">LAUNCH CALENDAR / UTC</span>
                <h2>
                  {month.toLocaleDateString("en", {
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </h2>
              </div>
              <div>
                <button
                  className="quiet-button"
                  aria-label="Previous month"
                  onClick={() => moveMonth(-1)}
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  className="quiet-button"
                  onClick={() => set("month", "")}
                >
                  Today
                </button>
                <button
                  className="quiet-button"
                  aria-label="Next month"
                  onClick={() => moveMonth(1)}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </header>
            <div className="calendar-grid">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              ))}
              {Array.from({ length: offset }, (_, i) => (
                <div className="calendar-blank" key={`blank-${i}`} />
              ))}
              {Array.from({ length: dayCount }, (_, i) => {
                const day = i + 1;
                const date = new Date(Date.UTC(year, monthIndex, day))
                  .toISOString()
                  .slice(0, 10);
                const launches = filtered.filter(
                  (launch) =>
                    hasCalendarDay(launch.net_precision) &&
                    launch.net.slice(0, 10) === date
                );
                return (
                  <div
                    className={`calendar-day ${
                      today.toISOString().slice(0, 10) === date ? "today" : ""
                    }`}
                    key={day}
                  >
                    <span>{day}</span>
                    {launches.map((launch) => (
                      <button
                        key={launch.id}
                        title={launch.name}
                        onClick={() => setSelected(launch)}
                      >
                        {launch.mission?.name || launch.name}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
            <p className="calendar-disclaimer">
              This calendar shows the retrieved upcoming schedule, up to 100
              missions. Missions with month, quarter, or year estimates are
              available in list view and are not pinned to a calendar day. Empty
              dates do not establish that no launches are scheduled.
            </p>
          </div>
        ))}
      <SourceNote updated={updated}>
        The Space Devs · Up to 100 upcoming launches · Schedule precision
        varies; check each mission.
      </SourceNote>
      <MissionBrief
        launch={selected}
        onClose={() => setSelected(null)}
        saved={!!selected && saved.includes(selected.id)}
        onSave={() => {
          if (selected) toggle(selected.id);
        }}
      />
    </ExplorerShell>
  );
}
function RocketMark() {
  return (
    <svg
      width="130"
      height="130"
      viewBox="0 0 130 130"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M63 17c-8 13-12 36-12 61h24c0-25-4-48-12-61Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m51 61-12 20v12l12-9m24-23 12 20v12l-12-9M57 85v15m6-15v23m6-23v15"
        stroke="currentColor"
      />
      <circle cx="63" cy="46" r="5" stroke="currentColor" />
    </svg>
  );
}
export default function LaunchCenter() {
  return (
    <Suspense
      fallback={
        <div className="explorer-loading">Preparing Launch Center…</div>
      }
    >
      <Content />
    </Suspense>
  );
}
