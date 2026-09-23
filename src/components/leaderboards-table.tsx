"use client";

import { useMemo, useState } from "react";

import type { AdminLeaderboardEntry, LeaderboardBoard } from "@/lib/admin-types";
import { formatTimestamp } from "@/lib/format";

const BOARD_LABEL: Record<LeaderboardBoard, string> = {
  daily: "Daily",
  weekly: "Weekly",
  all_time: "All time",
};

const BOARD_CLASS: Record<LeaderboardBoard, string> = {
  daily: "bg-amber-50 text-amber-900 ring-amber-600/20",
  weekly: "bg-sky-50 text-sky-800 ring-sky-700/20",
  all_time: "bg-violet-50 text-violet-800 ring-violet-600/20",
};

function formatScore(score: number): string {
  return new Intl.NumberFormat("en-GB").format(score);
}

export function LeaderboardsTable({
  entries,
}: {
  entries: AdminLeaderboardEntry[];
}) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const normalized = query.trim().toLowerCase();

  const visible = useMemo(() => {
    if (!normalized) {
      return entries;
    }
    return entries.filter((entry) => {
      const haystack = [entry.id, entry.username ?? "", entry.userId]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [entries, normalized]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-zinc-600">
          <span className="sr-only">Search leaderboards</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter this page by id, username, or user id"
            className="w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500"
          />
        </label>
        <p className="text-xs text-zinc-500">
          {visible.length} of {entries.length}
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="px-4 py-10 text-sm text-zinc-500">
          No leaderboard entries on this page.
        </p>
      ) : visible.length === 0 ? (
        <p className="px-4 py-10 text-sm text-zinc-500">
          No leaderboard entries match “{query.trim()}”.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  Rank
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Board
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  User
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Score
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Updated
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {visible.map((entry) => {
                const expanded = expandedId === entry.id;
                const detailId = `leaderboard-detail-${entry.id}`;
                return (
                  <LeaderboardRows
                    key={entry.id}
                    entry={entry}
                    expanded={expanded}
                    detailId={detailId}
                    onToggle={() => setExpandedId(expanded ? null : entry.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LeaderboardRows({
  entry,
  expanded,
  detailId,
  onToggle,
}: {
  entry: AdminLeaderboardEntry;
  expanded: boolean;
  detailId: string;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={`cursor-pointer ${expanded ? "bg-zinc-50" : "hover:bg-zinc-50"}`}
        onClick={onToggle}
      >
        <td className="px-4 py-3 font-medium text-zinc-900">{entry.rank}</td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${BOARD_CLASS[entry.board]}`}
          >
            {BOARD_LABEL[entry.board]}
          </span>
        </td>
        <td className="px-4 py-3">
          <p className="font-medium text-zinc-900">
            {entry.username ? `@${entry.username}` : entry.userId}
          </p>
          {entry.username ? (
            <p className="font-mono text-xs text-zinc-500">{entry.userId}</p>
          ) : null}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-zinc-900">
          {formatScore(entry.score)}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-zinc-700">
          {formatTimestamp(entry.updatedAt)}
        </td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={detailId}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
          >
            {expanded ? "Hide" : "Details"}
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td id={detailId} colSpan={6} className="bg-zinc-50 px-4 py-4">
            <LeaderboardDetail entry={entry} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function LeaderboardDetail({ entry }: { entry: AdminLeaderboardEntry }) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
      <DetailField label="Entry ID" value={entry.id} mono />
      <DetailField label="Board" value={entry.board} mono />
      <DetailField label="Rank" value={String(entry.rank)} />
      <DetailField label="User ID" value={entry.userId} mono />
      <DetailField
        label="Username"
        value={entry.username ? `@${entry.username}` : "—"}
      />
      <DetailField label="Score" value={formatScore(entry.score)} />
      <DetailField label="Updated" value={formatTimestamp(entry.updatedAt)} />
    </dl>
  );
}

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className={`mt-0.5 break-all text-zinc-900 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
