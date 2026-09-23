"use client";

import { useMemo, useState } from "react";

import type { AdminUser } from "@/lib/admin-types";
import { formatTimestamp } from "@/lib/format";

const STATUS_CLASS: Record<AdminUser["status"], string> = {
  active: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  suspended: "bg-amber-50 text-amber-900 ring-amber-600/20",
  banned: "bg-red-50 text-red-800 ring-red-600/20",
};

export function UsersTable({ users }: { users: AdminUser[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  const visible = useMemo(() => {
    if (!normalized) {
      return users;
    }
    return users.filter((user) => {
      const haystack = [
        user.id,
        user.username,
        user.displayName ?? "",
        user.status,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [normalized, users]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-zinc-600">
          <span className="sr-only">Search users</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter this page by id, name, or status"
            className="w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500"
          />
        </label>
        <p className="text-xs text-zinc-500">
          {visible.length} of {users.length}
        </p>
      </div>

      {users.length === 0 ? (
        <p className="px-4 py-10 text-sm text-zinc-500">No users on this page.</p>
      ) : visible.length === 0 ? (
        <p className="px-4 py-10 text-sm text-zinc-500">
          No users match “{query.trim()}”.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  ID
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  User
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {visible.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-700">{user.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">
                      {user.displayName ?? user.username}
                    </p>
                    <p className="text-xs text-zinc-500">@{user.username}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_CLASS[user.status]}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{formatTimestamp(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
