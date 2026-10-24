"use client";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, GitCompareArrows, Rocket, X } from "lucide-react";
import type { UnifiedRocket } from "@/lib/api";
import {
  DataState,
  ExplorerShell,
  SearchField,
  SourceNote,
  useFilters,
  useRemote,
} from "@/components/ExplorerKit";
import { StageStudy } from "@/components/StageStudy";
const RocketViewer = dynamic(() => import("@/components/RocketViewer"), {
  ssr: false,
  loading: () => (
    <div className="heritage-viewer explorer-loading">
      Preparing model viewer…
    </div>
  ),
});
const heritage = [
  {
    slug: "saturn-v",
    name: "Saturn V",
    era: "APOLLO / RETIRED",
    detail:
      "The three-stage launch vehicle that carried Apollo crews toward the Moon.",
    source: "https://science.nasa.gov/3d-resources/saturn-v/",
    credit: "NASA / Michael D. Carbajal",
  },
  {
    slug: "atlas-mercury",
    name: "Friendship 7",
    era: "MERCURY / RETIRED",
    detail:
      "The Mercury spacecraft from John Glenn's orbital mission, launched aboard an Atlas vehicle. This model depicts the capsule, not its launch rocket.",
    source:
      "https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Atlas%206%20(Friendship%207)",
    credit: "NASA 3D Resources",
  },
  {
    slug: "ares-i",
    name: "Ares I",
    era: "CONSTELLATION / HISTORICAL CONCEPT",
    detail:
      "A NASA design study from the Constellation program. This asset represents a historical concept, not an operational vehicle.",
    source:
      "https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Ares%201%20(A)",
    credit: "NASA 3D Resources",
  },
];
function value(number: number | null | undefined, unit = "") {
  return number != null && Number.isFinite(number)
    ? `${number.toLocaleString()}${unit ? ` ${unit}` : ""}`
    : "Not provided";
}
function RocketPhoto({ url, name }: { url: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return url && !failed ? (
    <img src={url} alt={name} loading="lazy" onError={() => setFailed(true)} />
  ) : (
    <div className="rocket-photo-fallback">
      <Rocket size={42} />
      <span>Photo unavailable</span>
    </div>
  );
}
function Content() {
  const { data, loading, error, retry, updated } =
    useRemote<UnifiedRocket>("/api/fleet");
  const { params, set } = useFilters();
  const query = params.get("q") || "",
    manufacturer = params.get("manufacturer") || "";
  const collection =
    params.get("collection") === "heritage" ? "heritage" : "modern";
  const requested = params.get("model") || "saturn-v";
  const asset = heritage.find((item) => item.slug === requested) || heritage[0];
  const [modelActive, setModelActive] = useState(false);
  const [focus, setFocus] = useState("all");
  const compareIds = (params.get("compare") || "")
    .split(",")
    .filter(Boolean)
    .slice(0, 2);
  const compared = data.filter((item) => compareIds.includes(String(item.id)));
  const [selected, setSelected] = useState<UnifiedRocket | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  const filtered = data.filter(
    (item) =>
      (!query ||
        `${item.name} ${item.family}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!manufacturer || item.manufacturer.name === manufacturer)
  );
  const toggleCompare = (id: number) => {
    const key = String(id);
    set(
      "compare",
      (compareIds.includes(key)
        ? compareIds.filter((value) => value !== key)
        : [...compareIds, key].slice(-2)
      ).join(",")
    );
  };
  return (
    <ExplorerShell
      title="Fleet Explorer"
      eyebrow="ENGINEERED FOR THE EXTRAORDINARY"
      description="Meet the machines that make the impossible feel within reach."
    >
      <div className="section-tabs">
        <button
          className={collection === "modern" ? "active" : ""}
          onClick={() => set("collection", "")}
        >
          Mission fleet <span>{data.length || "—"}</span>
        </button>
        <button
          className={collection === "heritage" ? "active" : ""}
          onClick={() => set("collection", "heritage")}
        >
          NASA 3D collection <span>03</span>
        </button>
      </div>
      {collection === "heritage" ? (
        <>
          <div className="heritage-layout">
            <div className="model-stage">
              <div className="model-choices" aria-label="Choose a NASA model">
                {heritage.map((item) => (
                  <button
                    key={item.slug}
                    aria-pressed={asset.slug === item.slug}
                    className={asset.slug === item.slug ? "active" : ""}
                    onClick={() => {
                      set("model", item.slug);
                      setFocus("all");
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              {modelActive ? (
                <RocketViewer
                  slug={asset.slug}
                  name={asset.name}
                  focus={focus}
                />
              ) : (
                <div className="model-launch">
                  <img
                    src={`/models/${asset.slug}.png`}
                    alt={`${asset.name} NASA 3D model preview`}
                  />
                  <button
                    className="primary-button"
                    onClick={() => setModelActive(true)}
                  >
                    Explore in 3D <ArrowUpRight size={16} />
                  </button>
                  <span>
                    Load on demand · Each model is approximately 0.1–1.1 MB
                  </span>
                </div>
              )}
            </div>
            <article className="model-information">
              <span className="eyebrow">{asset.era}</span>
              <h2>{asset.name}</h2>
              <p>{asset.detail}</p>
              <div className="component-focus">
                <span className="eyebrow">EXPLORE COMPONENTS</span>
                {[
                  {
                    id: "all",
                    label:
                      asset.slug === "atlas-mercury"
                        ? "Full spacecraft"
                        : "Full vehicle",
                    description: "View the complete source model.",
                  },
                  {
                    id: "payload",
                    label: "Upper section",
                    description:
                      asset.slug === "atlas-mercury"
                        ? "Focus on the upper section of the Mercury capsule."
                        : "The spacecraft or payload sits at the top of the launch vehicle.",
                  },
                  {
                    id: "engines",
                    label:
                      asset.slug === "atlas-mercury"
                        ? "Capsule base"
                        : "Propulsion section",
                    description:
                      "Explore the lower section of the source model.",
                  },
                ].map((item) => (
                  <button
                    className={focus === item.id ? "active" : ""}
                    key={item.id}
                    aria-pressed={focus === item.id}
                    onClick={() => {
                      setModelActive(true);
                      setFocus(item.id);
                    }}
                  >
                    <span>{item.label}</span>
                    <small>{item.description}</small>
                  </button>
                ))}
              </div>
              <div className="model-credit">
                <span>MODEL CREDIT</span>
                <p>{asset.credit}</p>
                <a href={asset.source} target="_blank" rel="noreferrer">
                  View the original asset <ArrowUpRight size={13} />
                </a>
                <small>
                  Source geometry is preserved and fitted to the viewer. These
                  models are visual references, not engineering drawings.
                </small>
              </div>
            </article>
          </div>
          <StageStudy />
        </>
      ) : (
        <>
          <div className="filter-toolbar">
            <SearchField
              value={query}
              onChange={(next) => set("q", next)}
              placeholder="Search vehicles or rocket families"
            />
            <label className="sr-only" htmlFor="fleet-manufacturer">
              Manufacturer
            </label>
            <select
              id="fleet-manufacturer"
              value={manufacturer}
              onChange={(event) => set("manufacturer", event.target.value)}
            >
              <option value="">All manufacturers</option>
              {[...new Set(data.map((item) => item.manufacturer.name))]
                .sort()
                .map((name) => (
                  <option key={name}>{name}</option>
                ))}
            </select>
            <span className="compare-hint">
              <GitCompareArrows size={15} />
              Choose two vehicles to compare
            </span>
          </div>
          <DataState
            loading={loading}
            error={error}
            empty={!filtered.length}
            retry={retry}
          />
          {!loading && !error && (
            <div className="fleet-cards">
              {filtered.map((rocket) => (
                <article className="fleet-card" key={rocket.id}>
                  <button
                    className="fleet-image"
                    aria-label={`Explore ${rocket.name}`}
                    onClick={() => setSelected(rocket)}
                  >
                    <RocketPhoto url={rocket.image_url} name={rocket.name} />
                    <span>
                      <ArrowUpRight size={18} />
                    </span>
                  </button>
                  <div className="fleet-card-info">
                    <span className="eyebrow">{rocket.manufacturer.name}</span>
                    <h2>
                      <button onClick={() => setSelected(rocket)}>
                        {rocket.name}
                      </button>
                    </h2>
                    <dl>
                      <div>
                        <dt>HEIGHT</dt>
                        <dd>{value(rocket.length, "m")}</dd>
                      </div>
                      <div>
                        <dt>PAYLOAD TO LEO</dt>
                        <dd>{value(rocket.leo_capacity, "kg")}</dd>
                      </div>
                    </dl>
                    <button
                      className={`compare-button ${
                        compareIds.includes(String(rocket.id)) ? "active" : ""
                      }`}
                      aria-pressed={compareIds.includes(String(rocket.id))}
                      onClick={() => toggleCompare(rocket.id)}
                    >
                      {compareIds.includes(String(rocket.id)) ? (
                        <Check size={14} />
                      ) : (
                        <GitCompareArrows size={14} />
                      )}{" "}
                      {compareIds.includes(String(rocket.id))
                        ? "Selected for comparison"
                        : "Compare vehicle"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {compared.length > 0 && (
            <section className="comparison-panel">
              <header>
                <div>
                  <span className="eyebrow">A DIFFERENT SENSE OF SCALE</span>
                  <h2>Side by side.</h2>
                </div>
                <button
                  className="quiet-button"
                  onClick={() => set("compare", "")}
                >
                  Clear selection <X size={13} />
                </button>
              </header>
              {compared.length < 2 ? (
                <p className="method-note">
                  Select one more vehicle to compare specifications.
                </p>
              ) : (
                <>
                  <div className="scale-comparison">
                    {compared.map((item) => (
                      <div key={item.id}>
                        <div className="scale-column">
                          <span
                            className="scale-rocket"
                            style={{
                              height: `${Math.max(
                                5,
                                ((item.length || 0) /
                                  Math.max(
                                    ...compared.map(
                                      (rocket) => rocket.length || 1
                                    )
                                  )) *
                                  220
                              )}px`,
                            }}
                          />
                        </div>
                        <strong>{item.name}</strong>
                        <span>{value(item.length, "m")}</span>
                      </div>
                    ))}
                  </div>
                  <p className="method-note">
                    Height bars use a common linear scale. The bar shapes do not
                    represent vehicle geometry.
                  </p>
                  <div className="table-scroll">
                    <table>
                      <caption>
                        Vehicle specification comparison · Source values;
                        missing values shown explicitly
                      </caption>
                      <thead>
                        <tr>
                          <th>Specification</th>
                          {compared.map((item) => (
                            <th key={item.id}>{item.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            label: "Manufacturer",
                            get: (item: UnifiedRocket) =>
                              item.manufacturer.name,
                          },
                          {
                            label: "Height",
                            get: (item: UnifiedRocket) =>
                              value(item.length, "m"),
                          },
                          {
                            label: "Diameter",
                            get: (item: UnifiedRocket) =>
                              value(item.diameter, "m"),
                          },
                          {
                            label: "Launch mass",
                            get: (item: UnifiedRocket) =>
                              value(item.launch_mass, "t"),
                          },
                          {
                            label: "Payload to LEO",
                            get: (item: UnifiedRocket) =>
                              value(item.leo_capacity, "kg"),
                          },
                          {
                            label: "Total launches",
                            get: (item: UnifiedRocket) =>
                              value(item.total_launch_count),
                          },
                          {
                            label: "Successful launches",
                            get: (item: UnifiedRocket) =>
                              value(item.successful_launches),
                          },
                          {
                            label: "Failed launches",
                            get: (item: UnifiedRocket) =>
                              value(item.failed_launches),
                          },
                        ].map((row) => (
                          <tr key={row.label}>
                            <th>{row.label}</th>
                            {compared.map((item) => (
                              <td key={item.id}>{row.get(item)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          )}
        </>
      )}
      <SourceNote updated={collection === "heritage" ? null : updated}>
        {collection === "heritage"
          ? "NASA 3D Resources · Three local GLB models · No NASA endorsement implied."
          : `The Space Devs · ${data.length} configurations retrieved from a curated set of eight · Specifications may be incomplete.`}
      </SourceNote>
      <dialog
        className="mission-dialog"
        ref={dialog}
        aria-label="Vehicle specifications"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="dialog-inner">
          <header>
            <span className="eyebrow">VEHICLE DOSSIER</span>
            <button
              aria-label="Close vehicle specifications"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} />
            </button>
          </header>
          {selected && (
            <>
              <h2>{selected.name}</h2>
              <div className="dossier-photo">
                <RocketPhoto url={selected.image_url} name={selected.name} />
              </div>
              <p>
                {selected.description ||
                  "No description provided by the source."}
              </p>
              <dl className="brief-specs">
                {[
                  ["Manufacturer", selected.manufacturer.name],
                  ["Height", value(selected.length, "m")],
                  ["Diameter", value(selected.diameter, "m")],
                  ["Launch mass", value(selected.launch_mass, "t")],
                  ["Payload to LEO", value(selected.leo_capacity, "kg")],
                  ["Flights", value(selected.total_launch_count)],
                ].map(([label, content]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{content}</dd>
                  </div>
                ))}
              </dl>
              {selected.info_url && (
                <a
                  className="primary-button"
                  href={selected.info_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Vehicle information <ArrowUpRight size={15} />
                </a>
              )}
            </>
          )}
        </div>
      </dialog>
    </ExplorerShell>
  );
}
export default function Fleet() {
  return (
    <Suspense
      fallback={
        <div className="explorer-loading">Preparing fleet explorer…</div>
      }
    >
      <Content />
    </Suspense>
  );
}
