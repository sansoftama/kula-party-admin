import type { Metadata } from "next";
import Link from "next/link";

import { ApiError } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import { PaymentsTable } from "@/components/payments-table";
import { getAdminPayments } from "@/lib/admin-api";
import type { PaymentStatus } from "@/lib/admin-types";
import { parseCursor, parseLimit, parsePaymentStatus } from "@/lib/format";

const DEFAULT_LIMIT = 20;

const STATUS_FILTERS: Array<{ label: string; status?: PaymentStatus }> = [
  { label: "All" },
  { label: "Pending", status: "pending" },
  { label: "Succeeded", status: "succeeded" },
  { label: "Failed", status: "failed" },
  { label: "Refunded", status: "refunded" },
];

export const metadata: Metadata = {
  title: "Payments",
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    limit?: string | string[];
    cursor?: string | string[];
    status?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const limit = parseLimit(params.limit, DEFAULT_LIMIT);
  const cursor = parseCursor(params.cursor);
  const status = parsePaymentStatus(params.status);
  const result = await getAdminPayments({ limit, cursor, status });

  return (
    <section>
      <PageHeader
        title="Payments"
        description="Read-only payments from GET /v1/admin/payments. Search filters the current page."
        mock={result.mock}
        baseUrl={result.baseUrl}
      />
      <StatusFilter limit={limit} status={status} />
      {result.ok ? (
        <>
          <PaymentsTable
            key={`${status ?? "all"}:${cursor ?? "start"}:${limit}`}
            payments={result.data.items}
          />
          <Pagination
            limit={limit}
            cursor={cursor}
            status={status}
            nextCursor={result.data.nextCursor}
          />
        </>
      ) : (
        <ApiError message={result.message} status={result.status} />
      )}
    </section>
  );
}

function paymentsPath(input: {
  limit: number;
  cursor?: string;
  status?: PaymentStatus;
  keepLimit?: boolean;
}): string {
  const params = new URLSearchParams();
  if (input.keepLimit || input.limit !== DEFAULT_LIMIT) {
    params.set("limit", String(input.limit));
  }
  if (input.status) {
    params.set("status", input.status);
  }
  if (input.cursor) {
    params.set("cursor", input.cursor);
  }
  const query = params.toString();
  return query ? `/payments?${query}` : "/payments";
}

function StatusFilter({
  limit,
  status,
}: {
  limit: number;
  status?: PaymentStatus;
}) {
  return (
    <nav aria-label="Filter by status" className="mb-3 flex flex-wrap gap-2">
      {STATUS_FILTERS.map((filter) => {
        const active = filter.status === status;
        return (
          <Link
            key={filter.label}
            href={paymentsPath({ limit, status: filter.status })}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1 text-sm ring-1 ring-inset ${
              active
                ? "bg-zinc-900 text-white ring-zinc-900"
                : "bg-white text-zinc-700 ring-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {filter.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Pagination({
  limit,
  cursor,
  status,
  nextCursor,
}: {
  limit: number;
  cursor?: string;
  status?: PaymentStatus;
  nextCursor?: string | null;
}) {
  const firstHref = paymentsPath({ limit, status });
  const nextHref = nextCursor
    ? paymentsPath({ limit, status, cursor: nextCursor, keepLimit: true })
    : null;

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-xs text-zinc-500">
        Limit {limit}
        {status ? ` · status ${status}` : ""}
        {cursor ? ` · cursor ${cursor}` : ""}
      </p>
      <div className="flex items-center gap-2">
        {cursor ? (
          <Link
            href={firstHref}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50"
          >
            First page
          </Link>
        ) : null}
        {nextHref ? (
          <Link
            href={nextHref}
            className="rounded-md border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800"
          >
            Next
          </Link>
        ) : (
          <span className="text-xs text-zinc-400">No further pages</span>
        )}
      </div>
    </div>
  );
}
