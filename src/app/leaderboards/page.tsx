import type { Metadata } from "next";
import Link from "next/link";

import { ApiError } from "@/components/api-error";
import { LeaderboardsTable } from "@/components/leaderboards-table";
import { PageHeader } from "@/components/page-header";
import { getAdminLeaderboards } from "@/lib/admin-api";
import type { LeaderboardBoard } from "@/lib/admin-types";
import { parseCursor, parseLeaderboardBoard, parseLimit } from "@/lib/format";

const DEFAULT_LIMIT = 20;

const BOARD_FILTERS: Array<{ label: string; board?: LeaderboardBoard }> = [
  { label: "All" },
  { label: "Daily", board: "daily" },
  { label: "Weekly", board: "weekly" },
  { label: "All time", board: "all_time" },
];

export const metadata: Metadata = {
  title: "Leaderboards",
};

export default async function LeaderboardsPage({
  searchParams,
}: {
  searchParams: Promise<{
    limit?: string | string[];
    cursor?: string | string[];
    board?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const limit = parseLimit(params.limit, DEFAULT_LIMIT);
  const cursor = parseCursor(params.cursor);
  const board = parseLeaderboardBoard(params.board);
  const result = await getAdminLeaderboards({ limit, cursor, board });

  return (
    <section>
      <PageHeader
        title="Leaderboards"
        description="Read-only leaderboards from GET /v1/admin/leaderboards. Search filters the current page."
        mock={result.mock}
        baseUrl={result.baseUrl}
      />
      <BoardFilter limit={limit} board={board} />
      {result.ok ? (
        <>
          <LeaderboardsTable
            key={`${board ?? "all"}:${cursor ?? "start"}:${limit}`}
            entries={result.data.items}
          />
          <Pagination
            limit={limit}
            cursor={cursor}
            board={board}
            nextCursor={result.data.nextCursor}
          />
        </>
      ) : (
        <ApiError message={result.message} status={result.status} />
      )}
    </section>
  );
}

function leaderboardsPath(input: {
  limit: number;
  cursor?: string;
  board?: LeaderboardBoard;
  keepLimit?: boolean;
}): string {
  const params = new URLSearchParams();
  if (input.keepLimit || input.limit !== DEFAULT_LIMIT) {
    params.set("limit", String(input.limit));
  }
  if (input.board) {
    params.set("board", input.board);
  }
  if (input.cursor) {
    params.set("cursor", input.cursor);
  }
  const query = params.toString();
  return query ? `/leaderboards?${query}` : "/leaderboards";
}

function BoardFilter({
  limit,
  board,
}: {
  limit: number;
  board?: LeaderboardBoard;
}) {
  return (
    <nav aria-label="Filter by board" className="mb-3 flex flex-wrap gap-2">
      {BOARD_FILTERS.map((filter) => {
        const active = filter.board === board;
        return (
          <Link
            key={filter.label}
            href={leaderboardsPath({ limit, board: filter.board })}
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
  board,
  nextCursor,
}: {
  limit: number;
  cursor?: string;
  board?: LeaderboardBoard;
  nextCursor?: string | null;
}) {
  const firstHref = leaderboardsPath({ limit, board });
  const nextHref = nextCursor
    ? leaderboardsPath({ limit, board, cursor: nextCursor, keepLimit: true })
    : null;

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-xs text-zinc-500">
        Limit {limit}
        {board ? ` · board ${board}` : ""}
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
