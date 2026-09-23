import type { Metadata } from "next";
import Link from "next/link";

import { ApiError } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import { UsersTable } from "@/components/users-table";
import { getAdminUsers } from "@/lib/admin-api";
import { parseCursor, parseLimit } from "@/lib/format";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    limit?: string | string[];
    cursor?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const limit = parseLimit(params.limit);
  const cursor = parseCursor(params.cursor);
  const result = await getAdminUsers({ limit, cursor });

  return (
    <section>
      <PageHeader
        title="Users"
        description="Read-only directory from GET /v1/admin/users. Search filters the current page."
        mock={result.mock}
        baseUrl={result.baseUrl}
      />
      {result.ok ? (
        <>
          <UsersTable users={result.data.items} />
          <Pagination
            limit={limit}
            cursor={cursor}
            nextCursor={result.data.nextCursor}
          />
        </>
      ) : (
        <ApiError message={result.message} status={result.status} />
      )}
    </section>
  );
}

function Pagination({
  limit,
  cursor,
  nextCursor,
}: {
  limit: number;
  cursor?: string;
  nextCursor?: string | null;
}) {
  const firstHref = limit === 50 ? "/users" : `/users?limit=${limit}`;
  const nextHref = nextCursor
    ? `/users?${new URLSearchParams({
        limit: String(limit),
        cursor: nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-xs text-zinc-500">
        Limit {limit}
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
