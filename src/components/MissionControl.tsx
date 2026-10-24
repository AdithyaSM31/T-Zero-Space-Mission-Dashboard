"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  Crosshair,
  ExternalLink,
  Globe2,
  MapPin,
  Radio,
  RefreshCw,
  Rocket,
  Satellite,
  X,
} from "lucide-react";
import type { Launch } from "@/lib/api";
const RocketViewer = dynamic(() => import("./RocketViewer"), { ssr: false });
const SpaceScene = dynamic(() => import("./SpaceScene"), {
  ssr: false,
  loading: () => (
    <div className="scene-loading">
      <span />
      Preparing the view
    </div>
  ),
});

type Mission = Launch & {
  net_precision?: { name: string; abbrev: string };
  pad: Launch["pad"] & { latitude?: string; longitude?: string };
};
const examples: Mission[] = [
  {
    id: "preview-1",
    name: "Falcon 9 | Starlink",
    net: "",
    window_start: "",
    window_end: "",
    status: { id: 0, name: "Illustrative mission", abbrev: "PREVIEW" },
    launch_service_provider: { id: 121, name: "SpaceX", type: "Commercial" },
    rocket: {
      configuration: {
        id: 1,
        name: "Falcon 9",
        family: "Falcon",
        variant: "Block 5",
      },
    },
    mission: {
      id: 1,
      name: "Starlink",
      type: "Communications",
      description:
        "Explore how T-Zero connects a mission, its launch vehicle, and its place on Earth. This example is for the design preview and does not represent an upcoming launch.",
    },
    pad: {
      id: 1,
      name: "Space Launch Complex 40",
      latitude: "28.562",
      longitude: "-80.577",
      location: { id: 1, name: "Cape Canaveral, Florida" },
    },
    image: "",
  },
  {
    id: "preview-2",
    name: "LVM3 | Lunar exploration",
    net: "",
    window_start: "",
    window_end: "",
    status: { id: 0, name: "Illustrative mission", abbrev: "PREVIEW" },
    launch_service_provider: { id: 31, name: "ISRO", type: "Government" },
    rocket: {
      configuration: { id: 2, name: "LVM3", family: "LVM3", variant: "" },
    },
    mission: {
      id: 2,
      name: "Lunar exploration",
      type: "Exploration",
      description:
        "An illustrative mission to demonstrate the launch-site explorer. This is not a confirmed or scheduled flight.",
    },
    pad: {
      id: 2,
      name: "Satish Dhawan Space Centre",
      latitude: "13.72",
      longitude: "80.23",
      location: { id: 2, name: "Sriharikota, India" },
    },
    image: "",
  },
  {
    id: "preview-3",
    name: "Ariane 6 | Beyond Earth",
    net: "",
    window_start: "",
    window_end: "",
    status: { id: 0, name: "Illustrative mission", abbrev: "PREVIEW" },
    launch_service_provider: {
      id: 115,
      name: "Arianespace",
      type: "Commercial",
    },
    rocket: {
      configuration: { id: 3, name: "Ariane 6", family: "Ariane", variant: "" },
    },
    mission: {
      id: 3,
      name: "Beyond Earth",
      type: "Science",
      description:
        "An illustrative mission from Europe's spaceport. This is design-preview content, not a launch announcement.",
    },
    pad: {
      id: 3,
      name: "Guiana Space Centre",
      latitude: "5.24",
      longitude: "-52.77",
      location: { id: 3, name: "Kourou, French Guiana" },
    },
    image: "",
  },
];
function Countdown({ date, precise }: { date?: string; precise: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const time = date ? Date.parse(date) : NaN;
  const seconds =
    now === null || !Number.isFinite(time) || !precise
      ? null
      : Math.max(0, Math.floor((time - now) / 1000));
  const values =
    seconds === null
      ? ["—", "—", "—", "—"]
      : [
          Math.floor(seconds / 86400),
          Math.floor(seconds / 3600) % 24,
          Math.floor(seconds / 60) % 60,
          seconds % 60,
        ].map((v) => String(v).padStart(2, "0"));
  return (
    <div
      className="countdown"
      aria-label={
        seconds === null
          ? "Countdown unavailable"
          : `${values[0]} days ${values[1]} hours ${values[2]} minutes until scheduled launch`
      }
    >
      {values.map((value, i) => (
        <div key={i}>
          <strong>{value}</strong>
          <span>{["DAYS", "HOURS", "MINS", "SECS"][i]}</span>
        </div>
      ))}
    </div>
  );
}
export function MissionControl() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [demo, setDemo] = useState(false);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [utc, setUtc] = useState(true);
  const [now, setNow] = useState<Date | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [dialogTab, setDialogTab] = useState<"mission" | "vehicle">("mission");
  const dialog = useRef<HTMLDialogElement>(null);
  const request = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(
      () => controller.abort(new Error("Launch source timed out")),
      15000
    );
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || ""
        }/api/launches/upcoming?limit=6`,
        { signal: controller.signal }
      );
      if (!response.ok) throw new Error("Launch source unavailable");
      const data: Mission[] = await response.json();
      if (
        !Array.isArray(data) ||
        data.some(
          (item) =>
            !item.id ||
            !item.rocket?.configuration ||
            !item.pad ||
            !item.launch_service_provider
        )
      )
        throw new Error("Invalid launch data");
      setMissions(data);
      setSelected(0);
      setDemo(false);
      setUpdated(new Date());
    } catch {
      if (request.current === controller) setError(true);
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
    return () => request.current?.abort();
  }, [load]);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    try {
      const stored = JSON.parse(localStorage.getItem("tzero-saved") || "[]");
      if (Array.isArray(stored) && stored.every((v) => typeof v === "string"))
        setSaved(stored);
    } catch {}
    return () => clearInterval(timer);
  }, []);
  const items = demo ? examples : missions;
  const mission = items[selected];
  const precise =
    !!mission &&
    ["MIN", "SEC"].includes(mission.net_precision?.abbrev || "") &&
    !/TBD|TBC|Hold|Cancelled|Failure/i.test(
      mission.status.abbrev + mission.status.name
    );
  const formatDate = (date: string, compact = false) =>
    date && Number.isFinite(Date.parse(date))
      ? new Intl.DateTimeFormat("en", {
          month: "short",
          day: "2-digit",
          ...(compact ? {} : { hour: "2-digit", minute: "2-digit" }),
          ...(utc ? { timeZone: "UTC" } : {}),
        }).format(new Date(date))
      : "Schedule not available";
  const saveMission = () => {
    if (!mission) return;
    setSaved((previous) => {
      const next = previous.includes(mission.id)
        ? previous.filter((id) => id !== mission.id)
        : [...previous, mission.id];
      try {
        localStorage.setItem("tzero-saved", JSON.stringify(next));
      } catch {}
      return next;
    });
  };
  const openDetails = (tab: "mission" | "vehicle") => {
    setDialogTab(tab);
    dialog.current?.showModal();
  };
  const lat = mission?.pad.latitude ? Number(mission.pad.latitude) : undefined;
  const lon = mission?.pad.longitude
    ? Number(mission.pad.longitude)
    : undefined;
  return (
    <div className="mission-control">
      <header className="workspace-topbar">
        <div className="breadcrumb">
          Workspace <ChevronRight size={13} />
          <span>Overview</span>
        </div>
        <div className="topbar-right">
          <span className={`connection ${error || demo ? "offline" : ""}`}>
            <span className="status-dot" />
            {loading
              ? "CONNECTING"
              : demo
              ? "DESIGN PREVIEW"
              : error
              ? "SOURCE UNAVAILABLE"
              : "SOURCE CONNECTED"}
          </span>
          <div className="time-toggle" aria-label="Display timezone">
            <button
              className={utc ? "active" : ""}
              onClick={() => setUtc(true)}
            >
              UTC
            </button>
            <button
              className={!utc ? "active" : ""}
              onClick={() => setUtc(false)}
            >
              Local
            </button>
          </div>
          <span className="header-clock">
            {now
              ? now.toLocaleTimeString("en-GB", utc ? { timeZone: "UTC" } : {})
              : "--:--:--"}
          </span>
        </div>
      </header>
      <div className="dashboard-body">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <span className="short-line" /> YOUR WINDOW TO THE COSMOS
            </div>
            <h1>A bigger perspective.</h1>
            <p>Every launch. Every discovery. One extraordinary journey.</p>
          </div>
          <Link className="quiet-button" href="/launch-center">
            Explore launches <ArrowUpRight size={16} />
          </Link>
        </div>
        {(error || demo) && (
          <div className="data-notice" role="status">
            <Radio size={16} />
            <span>
              {demo
                ? "Design preview · Example missions, no live schedules or telemetry."
                : missions.length
                ? "Refresh failed. Showing the last retrieved schedule; times may have changed."
                : "The launch source is unavailable. Retry or explore an explicitly labeled design preview."}
            </span>
            <button onClick={load} disabled={loading}>
              <RefreshCw size={13} className={loading ? "spin" : ""} />
              Retry
            </button>
            {!demo && (
              <button
                onClick={() => {
                  setDemo(true);
                  setSelected(0);
                }}
              >
                Preview design <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}
        <section className="orbital-stage" aria-label="Mission overview">
          <div className="stage-stars" />
          <div className="stage-title">
            <span className="eyebrow">
              <span className="status-dot" /> THE ORBITAL VIEW
            </span>
            <h2>
              Our home.
              <br />
              <span>Our launchpad.</span>
            </h2>
            <p>
              A world of possibilities,
              <br />
              just beyond the atmosphere.
            </p>
          </div>
          <div className="earth-viewport">
            <SpaceScene
              latitude={Number.isFinite(lat) ? lat : undefined}
              longitude={Number.isFinite(lon) ? lon : undefined}
            />
          </div>
          <div className="earth-label">
            <Crosshair size={14} />
            <span>
              {mission ? mission.pad.location.name : "EARTH · SOL SYSTEM"}
            </span>
          </div>
          <div className="earth-caption">
            <span>01 / EARTH</span>
            <span>
              Drag to explore <ArrowDown size={11} />
            </span>
          </div>
          <article className="next-mission">
            <div className="panel-eyebrow">
              <span>
                <Radio size={13} />
                {demo ? "EXAMPLE MISSION" : "NEXT ON THE HORIZON"}
              </span>
              <span className="mission-index">
                {String(selected + 1).padStart(2, "0")}
              </span>
            </div>
            {mission ? (
              <>
                <div className="agency-label">
                  {mission.launch_service_provider.name}
                  <span>{mission.status.abbrev}</span>
                </div>
                <h2>{mission.mission?.name || mission.name}</h2>
                <p className="vehicle-line">
                  {mission.rocket.configuration.name}
                  <span> / </span>
                  {mission.mission?.type || "Space mission"}
                </p>
                <div className="countdown-label">
                  {demo
                    ? "DESIGN PREVIEW · NO SCHEDULE"
                    : precise
                    ? "TIME TO SCHEDULED LAUNCH"
                    : "AWAITING A CONFIRMED LAUNCH TIME"}
                </div>
                <Countdown date={mission.net} precise={precise} />
                <div className="mission-meta">
                  <div>
                    <MapPin size={15} />
                    <span>{mission.pad.location.name}</span>
                  </div>
                  <div>
                    <ClockIcon />
                    <span>
                      {formatDate(mission.net)}
                      {mission.net ? (utc ? " UTC" : " local") : ""}
                    </span>
                  </div>
                </div>
                <button
                  className="primary-button"
                  onClick={() => openDetails("mission")}
                >
                  Explore mission <ArrowUpRight size={17} />
                </button>
                <button
                  className={`save-button ${
                    saved.includes(mission.id) ? "is-saved" : ""
                  }`}
                  onClick={saveMission}
                >
                  {saved.includes(mission.id) ? (
                    <Check size={14} />
                  ) : (
                    <Bookmark size={14} />
                  )}{" "}
                  {saved.includes(mission.id)
                    ? "Saved to this device"
                    : "Save mission"}
                </button>
              </>
            ) : (
              <div className="mission-empty">
                <Satellite size={35} />
                <h2>
                  {loading
                    ? "Connecting to the cosmos."
                    : error
                    ? "Awaiting a signal."
                    : "A quiet launch window."}
                </h2>
                <p>
                  {loading
                    ? "Retrieving the latest upcoming missions."
                    : error
                    ? "Mission schedules will appear here when the data source reconnects."
                    : "No upcoming missions were returned by the source."}
                </p>
                {!loading && (
                  <button className="quiet-button" onClick={load}>
                    <RefreshCw size={14} /> Refresh schedule
                  </button>
                )}
              </div>
            )}
          </article>
        </section>
        <div className="overview-strip">
          <div>
            <span className="strip-icon">
              <Rocket size={18} />
            </span>
            <div>
              <span>ON THE RADAR</span>
              <strong>
                {loading
                  ? "—"
                  : `${items.length} ${
                      demo ? "example missions" : "upcoming missions"
                    }`}
              </strong>
            </div>
          </div>
          <div>
            <span className="strip-icon">
              <Globe2 size={18} />
            </span>
            <div>
              <span>ACROSS THE GLOBE</span>
              <strong>
                {items.length
                  ? `${
                      new Set(items.map((m) => m.launch_service_provider.name))
                        .size
                    } launch providers`
                  : "Awaiting schedule"}
              </strong>
            </div>
          </div>
          <div>
            <span className="strip-icon">
              <Satellite size={18} />
            </span>
            <div>
              <span>YOUR COLLECTION</span>
              <strong>
                {saved.length} saved{" "}
                {saved.length === 1 ? "mission" : "missions"}
              </strong>
            </div>
          </div>
          <div className="strip-source">
            <span className="status-dot" />
            <span>
              {demo
                ? "ILLUSTRATIVE DATA"
                : updated
                ? `UPDATED ${updated.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    ...(utc ? { timeZone: "UTC" } : {}),
                  })}${utc ? " UTC" : ""}`
                : "AWAITING SOURCE"}
              <small>Schedule source: The Space Devs</small>
            </span>
          </div>
        </div>
        <section className="upcoming-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE JOURNEY CONTINUES</span>
              <h2>
                Coming up next<span className="count-pill">{items.length}</span>
              </h2>
            </div>
            <Link href="/launch-center">
              View launch calendar <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mission-cards">
            {loading && !items.length ? (
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="launch-card skeleton"
                  aria-label="Loading mission"
                />
              ))
            ) : items.length ? (
              items.slice(0, 3).map((item, index) => (
                <button
                  key={item.id}
                  className={`launch-card ${
                    selected === index ? "chosen" : ""
                  }`}
                  aria-pressed={selected === index}
                  onClick={() => setSelected(index)}
                >
                  <div className="card-top">
                    <span className={`provider-symbol provider-${index}`}>
                      <Rocket size={24} />
                    </span>
                    <span className="card-date">
                      {demo ? "DESIGN PREVIEW" : formatDate(item.net, true)}
                      <span>{demo ? "EXAMPLE" : item.status.abbrev}</span>
                    </span>
                  </div>
                  <span className="card-agency">
                    {item.launch_service_provider.name}
                  </span>
                  <h3>{item.mission?.name || item.name}</h3>
                  <p>{item.rocket.configuration.name}</p>
                  <div className="card-bottom">
                    <span>
                      <MapPin size={12} />
                      {item.pad.location.name}
                    </span>
                    <ArrowUpRight size={16} />
                  </div>
                </button>
              ))
            ) : (
              <div className="empty-schedule">
                <Radio size={24} />
                <p>
                  {error
                    ? "Launch data is temporarily unavailable."
                    : "No upcoming launches to display."}
                </p>
                <button className="quiet-button" onClick={load}>
                  Try again <RefreshCw size={14} />
                </button>
              </div>
            )}
          </div>
        </section>
        <section className="fleet-banner">
          <div className="fleet-banner-icon">
            <Rocket size={34} />
          </div>
          <div>
            <span className="eyebrow">ENGINEERED FOR THE EXTRAORDINARY</span>
            <h2>Get closer to the machines that take us further.</h2>
            <p>Discover the vehicles behind the missions.</p>
          </div>
          <button
            className="quiet-button"
            onClick={() => openDetails("vehicle")}
          >
            Explore in 3D <ArrowUpRight size={16} />
          </button>
        </section>
        <footer className="dashboard-footer">
          <span>
            T–ZERO <span>A little closer to the extraordinary.</span>
          </span>
          <span>
            BUILT FOR THE CURIOUS. <span className="status-dot" />
          </span>
        </footer>
      </div>
      <dialog
        className="mission-dialog"
        ref={dialog}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="dialog-inner">
          <header>
            <span className="eyebrow">MISSION EXPLORER</span>
            <button
              aria-label="Close mission explorer"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} />
            </button>
          </header>
          <div className="dialog-tabs">
            <button
              className={dialogTab === "mission" ? "active" : ""}
              onClick={() => setDialogTab("mission")}
            >
              Mission brief
            </button>
            <button
              className={dialogTab === "vehicle" ? "active" : ""}
              onClick={() => setDialogTab("vehicle")}
            >
              3D vehicle
            </button>
          </div>
          {dialogTab === "vehicle" ? (
            <>
              <div className="rocket-view">
                <RocketViewer slug="saturn-v" name="Saturn V" />
              </div>
              <h2>Saturn V · NASA heritage collection</h2>
              <p>
                Explore the NASA Saturn V model. This historical vehicle is
                independent of the selected mission. Model credit: NASA /
                Michael D. Carbajal.
              </p>
              <Link
                className="primary-button"
                href="/fleet-explorer?collection=heritage"
              >
                Browse the 3D collection <ArrowRight size={16} />
              </Link>
            </>
          ) : mission ? (
            <>
              <div className="agency-label">
                {mission.launch_service_provider.name} · {mission.status.name}
              </div>
              <h2>{mission.name}</h2>
              <p>
                {mission.mission?.description ||
                  "A mission description has not been provided by the source."}
              </p>
              <dl className="brief-specs">
                <div>
                  <dt>Launch vehicle</dt>
                  <dd>{mission.rocket.configuration.name}</dd>
                </div>
                <div>
                  <dt>Launch site</dt>
                  <dd>{mission.pad.name}</dd>
                </div>
                <div>
                  <dt>Scheduled launch</dt>
                  <dd>
                    {formatDate(mission.net)}{" "}
                    {mission.net ? (utc ? "UTC" : "local") : ""}
                  </dd>
                </div>
                <div>
                  <dt>Launch window</dt>
                  <dd>
                    {mission.window_start
                      ? `${formatDate(mission.window_start)} – ${formatDate(
                          mission.window_end
                        )}`
                      : "Not provided"}
                  </dd>
                </div>
              </dl>
              <p className="detail-footnote">
                {demo
                  ? "Illustrative content for the design preview."
                  : "Launch dates are subject to change. A countdown reflects the scheduled time, not launch clearance."}
              </p>
              <button className="primary-button" onClick={saveMission}>
                {saved.includes(mission.id) ? (
                  <Check size={16} />
                ) : (
                  <Bookmark size={16} />
                )}{" "}
                {saved.includes(mission.id)
                  ? "Saved · click to remove"
                  : "Save this mission"}
              </button>
              {!demo && (
                <a
                  className="detail-source"
                  href="https://thespacedevs.com/llapi"
                  target="_blank"
                  rel="noreferrer"
                >
                  About the schedule source <ExternalLink size={13} />
                </a>
              )}
            </>
          ) : (
            <p>Select a mission once the launch schedule is available.</p>
          )}
        </div>
      </dialog>
    </div>
  );
}
function ClockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
