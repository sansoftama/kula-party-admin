"use client";

import { useMemo, useState } from "react";

import type { AdminPayment } from "@/lib/admin-types";
import { formatMoney, formatTimestamp, shortId } from "@/lib/format";

const STATUS_CLASS: Record<AdminPayment["status"], string> = {
  pending: "bg-amber-50 text-amber-900 ring-amber-600/20",
  succeeded: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  failed: "bg-red-50 text-red-800 ring-red-600/20",
  refunded: "bg-sky-50 text-sky-800 ring-sky-700/20",
};

export function PaymentsTable({ payments }: { payments: AdminPayment[] }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const normalized = query.trim().toLowerCase();

  const visible = useMemo(() => {
    if (!normalized) {
      return payments;
    }
    return payments.filter((payment) => {
      const haystack = [
        payment.id,
        payment.username ?? "",
        payment.userId,
        payment.providerPaymentId ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [normalized, payments]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-zinc-600">
          <span className="sr-only">Search payments</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter this page by id, user, or provider payment id"
            className="w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500"
          />
        </label>
        <p className="text-xs text-zinc-500">
          {visible.length} of {payments.length}
        </p>
      </div>

      {payments.length === 0 ? (
        <p className="px-4 py-10 text-sm text-zinc-500">No payments on this page.</p>
      ) : visible.length === 0 ? (
        <p className="px-4 py-10 text-sm text-zinc-500">
          No payments match “{query.trim()}”.
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
                  User
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Provider
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
              {visible.map((payment) => {
                const expanded = expandedId === payment.id;
                const detailId = `payment-detail-${payment.id}`;
                return (
                  <PaymentRows
                    key={payment.id}
                    payment={payment}
                    expanded={expanded}
                    detailId={detailId}
                    onToggle={() => setExpandedId(expanded ? null : payment.id)}
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

function PaymentRows({
  payment,
  expanded,
  detailId,
  onToggle,
}: {
  payment: AdminPayment;
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
        <td className="px-4 py-3 font-mono text-xs text-zinc-700" title={payment.id}>
          {shortId(payment.id)}
        </td>
        <td className="px-4 py-3">
          <p className="font-medium text-zinc-900">
            {payment.username ? `@${payment.username}` : payment.userId}
          </p>
          {payment.username ? (
            <p className="font-mono text-xs text-zinc-500">{payment.userId}</p>
          ) : null}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-zinc-900">
          {formatMoney(payment.amount, payment.currency)}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_CLASS[payment.status]}`}
          >
            {payment.status}
          </span>
        </td>
        <td className="px-4 py-3 text-zinc-700">{payment.provider || "—"}</td>
        <td className="px-4 py-3 whitespace-nowrap text-zinc-700">
          {formatTimestamp(payment.createdAt)}
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
            <PaymentDetail payment={payment} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function PaymentDetail({ payment }: { payment: AdminPayment }) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
      <DetailField label="Payment ID" value={payment.id} mono />
      <DetailField label="User ID" value={payment.userId} mono />
      <DetailField
        label="Username"
        value={payment.username ? `@${payment.username}` : "—"}
      />
      <DetailField label="Amount" value={formatMoney(payment.amount, payment.currency)} />
      <DetailField label="Amount integer" value={String(payment.amount)} mono />
      <DetailField label="Currency" value={payment.currency} />
      <DetailField label="Status" value={payment.status} />
      <DetailField label="Provider" value={payment.provider || "—"} />
      <DetailField
        label="Provider payment ID"
        value={payment.providerPaymentId || "—"}
        mono={Boolean(payment.providerPaymentId)}
      />
      <DetailField label="Created" value={formatTimestamp(payment.createdAt)} />
      <DetailField
        label="Refunded at"
        value={payment.refundedAt ? formatTimestamp(payment.refundedAt) : "—"}
      />
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
