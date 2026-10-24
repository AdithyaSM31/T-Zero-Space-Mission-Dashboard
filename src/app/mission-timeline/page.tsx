"use client";
import { Suspense, useState } from "react";
import { ArrowUpRight, ChevronRight, Clock3 } from "lucide-react";
import type { Launch } from "@/lib/api";
import {
  DataState,
  ExplorerShell,
  SearchField,
  SourceNote,
  dateLabel,
  outcome,
  useFilters,
  useRemote,
} from "@/components/ExplorerKit";
import { MissionBrief, useSavedMissions } from "@/components/MissionBrief";
const milestones = [
  {
    year: "1957",
    title: "The space age begins.",
    description:
      "Sputnik 1 becomes the first artificial satellite to orbit Earth.",
    category: "Earth orbit",
    link: "https://www.nasa.gov/history/sputnik/",
  },
  {
    year: "1969",
    title: "One giant leap.",
    description: "Apollo 11 brings humanity to the surface of the Moon.",
    category: "Lunar exploration",
    link: "https://www.nasa.gov/mission/apollo-11/",
  },
  {
    year: "1998",
    title: "A home above Earth.",
    description:
      "The first element of the International Space Station launches, beginning an extraordinary international collaboration.",
    category: "Living in space",
    link: "https://www.nasa.gov/international-space-station/",
  },
  {
    year: "2021",
    title: "A new window on the universe.",
    description:
      "The James Webb Space Telescope launches on a journey to study the earliest galaxies and distant worlds.",
    category: "Deep space",
    link: "https://science.nasa.gov/mission/webb/",
  },
];
function Content() {
  const { data, loading, error, retry, updated } = useRemote<Launch>(
    "/api/launches/recent?limit=100"
  );
  const { params, set, reset } = useFilters();
  const [selected, setSelected] = useState<Launch | null>(null);
  const { saved, toggle } = useSavedMissions();
  const tab = params.get("tab") === "milestones" ? "milestones" : "recent";
  const q = params.get("q") || "",
    agency = params.get("agency") || "",
    status = params.get("status") || "";
  const launches = data.filter(
    (item) =>
      (!q || item.name.toLowerCase().includes(q.toLowerCase())) &&
      (!agency || item.launch_service_provider.name === agency) &&
      (!status || outcome(item.status.abbrev) === status)
  );
  return (
    <ExplorerShell
      title="Mission History"
      eyebrow="LOOK BACK. LOOK FURTHER."
      description="The missions that brought us here, and the moments that changed everything."
    >
      <div className="history-intro">
        <span className="eyebrow">HUMAN CURIOSITY, WITHOUT LIMITS</span>
        <h2>
          Every giant leap
          <br />
          starts with a question.
        </h2>
        <span className="history-year">
          1957 <span>→</span> NOW
        </span>
      </div>
      <div className="section-tabs">
        <button
          className={tab === "recent" ? "active" : ""}
          onClick={() => set("tab", "")}
        >
          Recent missions <span>{data.length || "—"}</span>
        </button>
        <button
          className={tab === "milestones" ? "active" : ""}
          onClick={() => set("tab", "milestones")}
        >
          Exploration milestones <span>04</span>
        </button>
      </div>
      {tab === "milestones" ? (
        <>
          <div className="milestone-list">
            {milestones.map((item, index) => (
              <article key={item.year}>
                <div className="milestone-year">
                  <span className="eyebrow">
                    CHAPTER {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong>{item.year}</strong>
                </div>
                <div>
                  <span className="eyebrow">{item.category}</span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <a href={item.link} target="_blank" rel="noreferrer">
                    Explore the story at NASA <ArrowUpRight size={14} />
                  </a>
                </div>
                <span className="milestone-orbit" aria-hidden="true" />
              </article>
            ))}
          </div>
          <SourceNote updated={null}>
            Curated historical milestones · NASA · A selection, not an
            exhaustive history.
          </SourceNote>
        </>
      ) : (
        <>
          <div className="filter-toolbar">
            <SearchField
              value={q}
              onChange={(value) => set("q", value)}
              placeholder="Search recent missions"
            />
            <label className="sr-only" htmlFor="history-agency">
              Launch provider
            </label>
            <select
              id="history-agency"
              value={agency}
              onChange={(event) => set("agency", event.target.value)}
            >
              <option value="">All providers</option>
              {[
                ...new Set(
                  data.map((item) => item.launch_service_provider.name)
                ),
              ]
                .sort()
                .map((name) => (
                  <option key={name}>{name}</option>
                ))}
            </select>
            <label className="sr-only" htmlFor="history-outcome">
              Outcome
            </label>
            <select
              id="history-outcome"
              value={status}
              onChange={(event) => set("status", event.target.value)}
            >
              <option value="">All outcomes</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="partial">Partial failure</option>
              <option value="other">Other / pending</option>
            </select>
            {(q || agency || status) && (
              <button className="quiet-button" onClick={reset}>
                Clear filters
              </button>
            )}
          </div>
          <div className="results-caption">
            {launches.length} missions · Recent source sample · UTC dates
          </div>
          <DataState
            loading={loading}
            error={error}
            empty={!launches.length}
            retry={retry}
          />
          {!loading && !error && (
            <div className="history-timeline">
              {launches.map((launch) => (
                <button
                  className="history-entry"
                  key={launch.id}
                  onClick={() => setSelected(launch)}
                >
                  <span className="history-date">
                    <Clock3 size={13} />
                    {dateLabel(launch.net)}
                  </span>
                  <div>
                    <span className="eyebrow">
                      {launch.launch_service_provider.name}
                    </span>
                    <h3>{launch.mission?.name || launch.name}</h3>
                    <p>
                      {launch.rocket.configuration.name} ·{" "}
                      {launch.pad.location.name}
                    </p>
                  </div>
                  <span
                    className={`outcome-badge ${outcome(launch.status.abbrev)}`}
                  >
                    {launch.status.name}
                  </span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          )}
          <SourceNote updated={updated}>
            Up to 100 recent launches from The Space Devs. This is a bounded
            recent sample, not the full historical archive.
          </SourceNote>
        </>
      )}
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
export default function History() {
  return (
    <Suspense
      fallback={
        <div className="explorer-loading">Preparing mission history…</div>
      }
    >
      <Content />
    </Suspense>
  );
}
