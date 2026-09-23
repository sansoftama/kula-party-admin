"use client";

import { useMemo, useState } from "react";

import type { AdminReport } from "@/lib/admin-types";
import { formatTimestamp } from "@/lib/format";

const STATUS_CLASS: Record<AdminReport["status"], string> = {
  open: "bg-amber-50 text-amber-900 ring-amber-600/20",
  resolved: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  dismissed: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
};

export function ReportsTable({ reports }: { reports: AdminReport[] }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const normalized = query.trim().toLowerCase();

  const visible = useMemo(() => {
    if (!normalized) {
      return reports;
    }
    return reports.filter((report) => {
      const haystack = [
        report.reporterId,
        report.reporterUsername ?? "",
        report.targetType,
        report.targetId,
        report.targetLabel ?? "",
        report.reason,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [normalized, reports]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-zinc-600">
          <span className="sr-only">Search reports</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter this page by reporter, target, or reason"
            className="w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500"
          />
        </label>
        <p className="text-xs text-zinc-500">
          {visible.length} of {reports.length}
        </p>
      </div>

      {reports.length === 0 ? (
        <p className="px-4 py-10 text-sm text-zinc-500">No reports on this page.</p>
      ) : visible.length === 0 ? (
        <p className="px-4 py-10 text-sm text-zinc-500">
          No reports match “{query.trim()}”.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  ID
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Reporter
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Target
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Reason
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Created
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {visible.map((report) => {
                const expanded = expandedId === report.id;
                const detailId = `report-detail-${report.id}`;
                return (
                  <ReportRows
                    key={report.id}
                    report={report}
                    expanded={expanded}
                    detailId={detailId}
                    onToggle={() => setExpandedId(expanded ? null : report.id)}
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

function ReportRows({
  report,
  expanded,
  detailId,
  onToggle,
}: {
  report: AdminReport;
  expanded: boolean;
  detailId: string;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className={expanded ? "bg-zinc-50" : undefined}>
        <td className="px-4 py-3 font-mono text-xs text-zinc-700">{report.id}</td>
        <td className="px-4 py-3">
          <p className="font-medium text-zinc-900">
            {report.reporterUsername ? `@${report.reporterUsername}` : report.reporterId}
          </p>
          {report.reporterUsername ? (
            <p className="font-mono text-xs text-zinc-500">{report.reporterId}</p>
          ) : null}
        </td>
        <td className="px-4 py-3">
          <p className="font-medium capitalize text-zinc-900">{report.targetType}</p>
          <p className="text-xs text-zinc-500">{report.targetLabel || report.targetId}</p>
        </td>
        <td className="max-w-xs px-4 py-3 text-zinc-700">
          <p className="truncate" title={report.reason}>
            {report.reason}
          </p>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_CLASS[report.status]}`}
          >
            {report.status}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-zinc-700">
          {formatTimestamp(report.createdAt)}
        </td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={detailId}
            onClick={onToggle}
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
          >
            {expanded ? "Hide" : "Details"}
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td id={detailId} colSpan={7} className="bg-zinc-50 px-4 py-4">
            <ReportDetail report={report} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function ReportDetail({ report }: { report: AdminReport }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
      <dl className="grid gap-3 text-sm">
        <DetailField label="Report ID" value={report.id} mono />
        <DetailField label="Reporter ID" value={report.reporterId} mono />
        <DetailField
          label="Reporter username"
          value={report.reporterUsername ? `@${report.reporterUsername}` : "—"}
        />
        <DetailField label="Target type" value={report.targetType} />
        <DetailField label="Target ID" value={report.targetId} mono />
        <DetailField label="Target label" value={report.targetLabel || "—"} />
      </dl>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Reason</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">{report.reason}</p>
      </div>
    </div>
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
