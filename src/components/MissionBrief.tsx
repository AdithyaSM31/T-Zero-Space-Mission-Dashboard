"use client";
import { useEffect, useRef, useState } from "react";
import { Bookmark, Check, MapPin, X } from "lucide-react";
import type { Launch } from "@/lib/api";
import { dateLabel, scheduleDate, scheduleTime } from "./ExplorerKit";
export function useSavedMissions() {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    const read = () => {
      try {
        const data = JSON.parse(localStorage.getItem("tzero-saved") || "[]");
        if (Array.isArray(data))
          setSaved(data.filter((id) => typeof id === "string"));
      } catch {}
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);
  const toggle = (id: string) =>
    setSaved((previous) => {
      const next = previous.includes(id)
        ? previous.filter((value) => value !== id)
        : [...previous, id];
      try {
        localStorage.setItem("tzero-saved", JSON.stringify(next));
      } catch {}
      return next;
    });
  return { saved, toggle };
}
export function MissionBrief({
  launch,
  onClose,
  saved,
  onSave,
}: {
  launch: Launch | null;
  onClose: () => void;
  saved: boolean;
  onSave: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (launch && !dialog.current?.open) dialog.current?.showModal();
    else if (!launch) dialog.current?.close();
  }, [launch]);
  return (
    <dialog
      ref={dialog}
      className="mission-dialog"
      aria-label="Mission details"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current.close();
      }}
    >
      <div className="dialog-inner">
        <header>
          <span className="eyebrow">MISSION BRIEF / UTC</span>
          <button
            aria-label="Close mission details"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </header>
        {launch && (
          <>
            <div className="brief-badge">
              <span className="status-dot" />
              {launch.status.name}
            </div>
            <h2>{launch.name}</h2>
            <p>
              {launch.mission?.description ||
                "The source has not provided a mission description."}
            </p>
            <dl className="brief-specs">
              <div>
                <dt>Launch provider</dt>
                <dd>{launch.launch_service_provider.name}</dd>
              </div>
              <div>
                <dt>Vehicle</dt>
                <dd>{launch.rocket.configuration.name}</dd>
              </div>
              <div>
                <dt>Scheduled time</dt>
                <dd>
                  {scheduleDate(launch)} · {scheduleTime(launch)}
                </dd>
              </div>
              <div>
                <dt>Launch window</dt>
                <dd>
                  {launch.window_start
                    ? dateLabel(launch.window_start, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not provided"}{" "}
                  –{" "}
                  {launch.window_end
                    ? dateLabel(launch.window_end, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not provided"}{" "}
                  UTC
                </dd>
              </div>
              <div>
                <dt>
                  <MapPin size={13} /> Launch site
                </dt>
                <dd>
                  {launch.pad.name}
                  <br />
                  {launch.pad.location.name}
                </dd>
              </div>
            </dl>
            <p className="detail-footnote">
              Schedules may change. A listed time does not imply launch
              clearance.
            </p>
            <button className="primary-button" onClick={onSave}>
              {saved ? <Check size={15} /> : <Bookmark size={15} />}{" "}
              {saved ? "Saved · remove from collection" : "Save to this device"}
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}
