"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import type { Launch } from "@/lib/api";
import { outcomeMetrics } from "@/lib/mission-metrics";
import {
  DataState,
  ExplorerShell,
  SourceNote,
  dateLabel,
  outcome,
  useFilters,
  useRemote,
} from "@/components/ExplorerKit";
const ActivityChart = dynamic(() => import("@/components/ActivityChart"), {
  ssr: false,
  loading: () => <div className="activity-chart skeleton" />,
});
function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
function Content() {
  const { data, loading, error, retry, updated } = useRemote<Launch>(
    "/api/launches/recent?limit=100"
  );
  const { params, set } = useFilters();
  const agency = params.get("agency") || "",
    from = params.get("from") || "",
    to = params.get("to") || "";
  const sample = data.filter(
    (item) =>
      (!agency || item.launch_service_provider.name === agency) &&
      (!from || item.net.slice(0, 10) >= from) &&
      (!to || item.net.slice(0, 10) <= to)
  );
  const { success, failure, partial, completed, other } =
    outcomeMetrics(sample);
  const countBy = (key: (item: Launch) => string) =>
    Object.entries(
      sample.reduce<Record<string, number>>((acc, item) => {
        const value = key(item);
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]);
  const providers = countBy((item) => item.launch_service_provider.name),
    vehicles = countBy((item) => item.rocket.configuration.name);
  const activity = countBy((item) => item.net.slice(0, 10))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({
      name: dateLabel(date, { year: undefined }),
      count,
      date,
    }));
  const sortedDates = sample.map((item) => item.net).sort();
  const download = () => {
    const rows = [
      ["Mission", "Provider", "Vehicle", "UTC date", "Status"],
      ...sample.map((item) => [
        item.name,
        item.launch_service_provider.name,
        item.rocket.configuration.name,
        item.net,
        item.status.name,
      ]),
    ];
    const blob = new Blob(
      [
        rows
          .map((row) =>
            row
              .map((value) =>
                csvCell(/^[=+@-]/.test(value) ? `'${value}` : value)
              )
              .join(",")
          )
          .join("\r\n"),
      ],
      { type: "text/csv;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tzero-launch-sample.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <ExplorerShell
      title="Analytics"
      eyebrow="SEE THE PATTERNS BEHIND THE PROGRESS"
      description="A clear view of recent launch activity, with the context that matters."
      action={
        <button
          className="quiet-button"
          onClick={download}
          disabled={loading || !!error || !sample.length}
        >
          <Download size={14} />
          Export CSV
        </button>
      }
    >
      <div className="filter-toolbar">
        <label className="sr-only" htmlFor="analytics-agency">
          Launch provider
        </label>
        <select
          id="analytics-agency"
          value={agency}
          onChange={(event) => set("agency", event.target.value)}
        >
          <option value="">All providers</option>
          {[...new Set(data.map((item) => item.launch_service_provider.name))]
            .sort()
            .map((name) => (
              <option key={name}>{name}</option>
            ))}
        </select>
        <label className="date-filter">
          From{" "}
          <input
            type="date"
            value={from}
            onChange={(event) => set("from", event.target.value)}
          />
        </label>
        <label className="date-filter">
          To{" "}
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => set("to", event.target.value)}
          />
        </label>
      </div>
      <div className="sample-notice">
        <ArrowUpRight size={17} />
        <p>
          <strong>A recent sample, in perspective.</strong> Metrics describe up
          to 100 recently retrieved launches. They are not all-time or
          year-to-date totals. Filters operate within this sample.
        </p>
      </div>
      <DataState
        loading={loading}
        error={error}
        empty={!sample.length}
        retry={retry}
      />
      {!loading && !error && sample.length > 0 && (
        <>
          <div className="metric-grid">
            {[
              {
                label: "MISSIONS IN SAMPLE",
                value: sample.length,
                detail: `${dateLabel(sortedDates[0])} – ${dateLabel(
                  sortedDates.at(-1)!
                )}`,
              },
              {
                label: "CONFIRMED SUCCESS RATE",
                value: completed
                  ? `${((success / completed) * 100).toFixed(1)}%`
                  : "—",
                detail: `${success} successful / ${completed} classified outcomes`,
              },
              {
                label: "LAUNCH PROVIDERS",
                value: providers.length,
                detail: "Distinct providers in this selection",
              },
              {
                label: "VEHICLE CONFIGURATIONS",
                value: vehicles.length,
                detail: "Distinct configurations in this selection",
              },
            ].map((item) => (
              <article className="metric-card" key={item.label}>
                <span className="eyebrow">{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="analytics-grid">
            <article className="chart-panel">
              <span className="eyebrow">THE RHYTHM OF EXPLORATION</span>
              <h2>Launch activity</h2>
              <p>Launches per UTC day represented in the selected sample.</p>
              <ActivityChart data={activity} />
              <details className="data-details">
                <summary>View chart data</summary>
                <div className="table-scroll">
                  <table>
                    <caption>Launch activity by UTC date</caption>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Launches</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.map((item) => (
                        <tr key={item.date}>
                          <td>{item.date}</td>
                          <td>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </article>
            <article className="chart-panel">
              <span className="eyebrow">MISSION OUTCOMES</span>
              <h2>Every result counts.</h2>
              <div
                className="outcome-stack"
                role="img"
                aria-label={`${success} successes, ${failure} failures, ${partial} partial failures, ${other} other or pending outcomes`}
              >
                {[
                  [success, "success"],
                  [failure, "failure"],
                  [partial, "partial"],
                  [other, "other"],
                ].map(([value, key]) => (
                  <span
                    key={key}
                    className={String(key)}
                    style={{
                      width: `${(Number(value) / sample.length) * 100}%`,
                    }}
                  />
                ))}
              </div>
              <dl className="outcome-legend">
                {[
                  ["Successful", success, "success"],
                  ["Failed", failure, "failure"],
                  ["Partial failure", partial, "partial"],
                  ["Other / pending", other, "other"],
                ].map(([label, value, key]) => (
                  <div key={label}>
                    <dt>
                      <span className={String(key)} />
                      {label}
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="method-note">
                Success rate = successful ÷ (successful + failed + partial
                failure). Other and pending statuses are excluded from that
                denominator.
              </p>
            </article>
            <article className="chart-panel">
              <span className="eyebrow">PROVIDERS IN THIS SAMPLE</span>
              <h2>Who is launching?</h2>
              <div className="rank-list">
                {providers.map(([name, count], index) => (
                  <div key={name}>
                    <div>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{name}</strong>
                      <b>{count}</b>
                    </div>
                    <div className="rank-track">
                      <span
                        style={{ width: `${(count / sample.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
            <article className="chart-panel">
              <span className="eyebrow">VEHICLES IN THIS SAMPLE</span>
              <h2>The workhorses.</h2>
              <div className="rank-list">
                {vehicles.map(([name, count], index) => (
                  <div key={name}>
                    <div>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{name}</strong>
                      <b>{count}</b>
                    </div>
                    <div className="rank-track">
                      <span
                        style={{ width: `${(count / sample.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </>
      )}
      <SourceNote updated={updated}>
        The Space Devs · Up to 100 recent records · Outcome classifications
        follow the source.
      </SourceNote>
    </ExplorerShell>
  );
}
export default function Analytics() {
  return (
    <Suspense
      fallback={<div className="explorer-loading">Preparing analytics…</div>}
    >
      <Content />
    </Suspense>
  );
}
