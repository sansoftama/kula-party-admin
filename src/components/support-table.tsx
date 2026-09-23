"use client";

import { useMemo, useState } from "react";

import type {
  AdminSupportTicket,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/lib/admin-types";
import { formatTimestamp, shortId } from "@/lib/format";

const STATUS_CLASS: Record<SupportTicketStatus, string> = {
  open: "bg-amber-50 text-amber-900 ring-amber-600/20",
  pending: "bg-sky-50 text-sky-800 ring-sky-700/20",
  resolved: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  closed: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
};

const PRIORITY_CLASS: Record<SupportTicketPriority, string> = {
  low: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
  normal: "bg-sky-50 text-sky-800 ring-sky-700/20",
  high: "bg-red-50 text-red-800 ring-red-600/20",
};

export function SupportTable({ tickets }: { tickets: AdminSupportTicket[] }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const normalized = query.trim().toLowerCase();

  const visible = useMemo(() => {
    if (!normalized) {
      return tickets;
    }
    return tickets.filter((ticket) => {
      const haystack = [
        ticket.id,
        ticket.subject,
        ticket.username ?? "",
        ticket.userId,
        ticket.bodyPreview ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [normalized, tickets]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-zinc-600">
          <span className="sr-only">Search support tickets</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter this page by id, subject, user, or preview"
            className="w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500"
          />
        </label>
        <p className="text-xs text-zinc-500">
          {visible.length} of {tickets.length}
        </p>
      </div>

      {tickets.length === 0 ? (
        <p className="px-4 py-10 text-sm text-zinc-500">No support tickets on this page.</p>
      ) : visible.length === 0 ? (
        <p className="px-4 py-10 text-sm text-zinc-500">
          No support tickets match “{query.trim()}”.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  ID
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Subject
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  User
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Priority
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
              {visible.map((ticket) => {
                const expanded = expandedId === ticket.id;
                const detailId = `support-detail-${ticket.id}`;
                return (
                  <TicketRows
                    key={ticket.id}
                    ticket={ticket}
                    expanded={expanded}
                    detailId={detailId}
                    onToggle={() => setExpandedId(expanded ? null : ticket.id)}
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

function TicketRows({
  ticket,
  expanded,
  detailId,
  onToggle,
}: {
  ticket: AdminSupportTicket;
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
        <td className="px-4 py-3 font-mono text-xs text-zinc-700" title={ticket.id}>
          {shortId(ticket.id)}
        </td>
        <td className="px-4 py-3 text-zinc-900">{ticket.subject}</td>
        <td className="px-4 py-3">
          <p className="font-medium text-zinc-900">
            {ticket.username ? `@${ticket.username}` : ticket.userId}
          </p>
          {ticket.username ? (
            <p className="font-mono text-xs text-zinc-500">{ticket.userId}</p>
          ) : null}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_CLASS[ticket.status]}`}
          >
            {ticket.status}
          </span>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${PRIORITY_CLASS[ticket.priority]}`}
          >
            {ticket.priority}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-zinc-700">
          {formatTimestamp(ticket.createdAt)}
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
          <td id={detailId} colSpan={7} className="bg-zinc-50 px-4 py-4">
            <TicketDetail ticket={ticket} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function TicketDetail({ ticket }: { ticket: AdminSupportTicket }) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
      <DetailField label="Ticket ID" value={ticket.id} mono />
      <DetailField label="User ID" value={ticket.userId} mono />
      <DetailField
        label="Username"
        value={ticket.username ? `@${ticket.username}` : "—"}
      />
      <DetailField label="Subject" value={ticket.subject} />
      <DetailField label="Status" value={ticket.status} />
      <DetailField label="Priority" value={ticket.priority} />
      <DetailField label="Created" value={formatTimestamp(ticket.createdAt)} />
      <DetailField
        label="Updated"
        value={ticket.updatedAt ? formatTimestamp(ticket.updatedAt) : "—"}
      />
      <div className="sm:col-span-2 lg:col-span-3">
        <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Body preview
        </dt>
        <dd className="mt-0.5 whitespace-pre-wrap text-zinc-900">
          {ticket.bodyPreview || "—"}
        </dd>
      </div>
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
