"use client";

import { useMemo, useRef, useState } from "react";

import { updateRoomFlag } from "@/app/rooms/actions";
import { ApiError } from "@/components/api-error";
import { ROOM_FLAGS, type AdminRoom, type RoomFlag, type RoomStatus } from "@/lib/admin-types";
import { formatTimestamp } from "@/lib/format";

const FLAG_LABELS: Record<RoomFlag, string> = {
  featured: "Featured",
  nsfw_lock: "NSFW lock",
  recording: "Recording",
  vip_only: "VIP only",
};

const KNOWN_FLAGS = new Set<string>(ROOM_FLAGS);

const STATUS_CLASS: Record<RoomStatus, string> = {
  live: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  idle: "bg-amber-50 text-amber-900 ring-amber-600/20",
  closed: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
};

function formatCount(count: number): string {
  return new Intl.NumberFormat("en-GB").format(count);
}

export function RoomsTable({ rooms }: { rooms: AdminRoom[] }) {
  const [items, setItems] = useState(rooms);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const normalized = query.trim().toLowerCase();

  const visible = useMemo(() => {
    if (!normalized) {
      return items;
    }
    return items.filter((room) => {
      const haystack = [
        room.id,
        room.name,
        room.hostUsername ?? "",
        room.hostId,
        ...room.flags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [normalized, items]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-zinc-600">
          <span className="sr-only">Search rooms</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter this page by id, name, host, or flag"
            className="w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500"
          />
        </label>
        <p className="text-xs text-zinc-500">
          {visible.length} of {items.length}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-10 text-sm text-zinc-500">No rooms on this page.</p>
      ) : visible.length === 0 ? (
        <p className="px-4 py-10 text-sm text-zinc-500">
          No rooms match “{query.trim()}”.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  Name
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Host
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Participants
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Flags
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
              {visible.map((room) => {
                const expanded = expandedId === room.id;
                const detailId = `room-detail-${room.id}`;
                return (
                  <RoomRows
                    key={room.id}
                    room={room}
                    expanded={expanded}
                    detailId={detailId}
                    onToggle={() => setExpandedId(expanded ? null : room.id)}
                    onRoomUpdated={(updated) => {
                      setItems((current) =>
                        current.map((item) => (item.id === updated.id ? updated : item)),
                      );
                    }}
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

function RoomRows({
  room,
  expanded,
  detailId,
  onToggle,
  onRoomUpdated,
}: {
  room: AdminRoom;
  expanded: boolean;
  detailId: string;
  onToggle: () => void;
  onRoomUpdated: (room: AdminRoom) => void;
}) {
  const [pendingFlag, setPendingFlag] = useState<RoomFlag | null>(null);
  const [flagError, setFlagError] = useState<{ message: string; status?: number } | null>(
    null,
  );
  const pendingRef = useRef<RoomFlag | null>(null);

  async function toggleFlag(flag: RoomFlag, enabled: boolean) {
    if (pendingRef.current) {
      return;
    }
    pendingRef.current = flag;
    setPendingFlag(flag);
    setFlagError(null);
    try {
      const result = await updateRoomFlag({ id: room.id, flag, enabled });
      if (result.ok) {
        onRoomUpdated(result.data);
      } else {
        setFlagError({ message: result.message, status: result.status });
      }
    } catch (error) {
      setFlagError({
        message: error instanceof Error ? error.message : "Could not update the room flag.",
      });
    } finally {
      pendingRef.current = null;
      setPendingFlag(null);
    }
  }

  return (
    <>
      <tr
        className={`cursor-pointer ${expanded ? "bg-zinc-50" : "hover:bg-zinc-50"}`}
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <p className="font-medium text-zinc-900">{room.name}</p>
          <p className="font-mono text-xs text-zinc-500">{room.id}</p>
        </td>
        <td className="px-4 py-3">
          <p className="font-medium text-zinc-900">
            {room.hostUsername ? `@${room.hostUsername}` : room.hostId}
          </p>
          {room.hostUsername ? (
            <p className="font-mono text-xs text-zinc-500">{room.hostId}</p>
          ) : null}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_CLASS[room.status]}`}
          >
            {room.status}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-zinc-900">
          {formatCount(room.participantCount)}
        </td>
        <td className="px-4 py-3">
          <FlagChips flags={room.flags} />
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-zinc-700">
          {formatTimestamp(room.createdAt)}
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
            <RoomDetail
              room={room}
              pendingFlag={pendingFlag}
              flagError={flagError}
              onToggleFlag={(flag, enabled) => {
                void toggleFlag(flag, enabled);
              }}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function FlagChips({ flags }: { flags: string[] }) {
  if (flags.length === 0) {
    return <span className="text-zinc-400">—</span>;
  }

  return (
    <ul className="flex flex-wrap gap-1">
      {flags.map((flag) => (
        <li key={flag}>
          <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-700 ring-1 ring-inset ring-zinc-500/20">
            {flag}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RoomDetail({
  room,
  pendingFlag,
  flagError,
  onToggleFlag,
}: {
  room: AdminRoom;
  pendingFlag: RoomFlag | null;
  flagError: { message: string; status?: number } | null;
  onToggleFlag: (flag: RoomFlag, enabled: boolean) => void;
}) {
  const otherFlags = room.flags.filter((flag) => !KNOWN_FLAGS.has(flag));
  const pending = pendingFlag !== null;

  return (
    <div className="grid gap-4">
      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Room ID" value={room.id} mono />
        <DetailField label="Name" value={room.name} />
        <DetailField label="Host ID" value={room.hostId} mono />
        <DetailField
          label="Host username"
          value={room.hostUsername ? `@${room.hostUsername}` : "—"}
        />
        <DetailField label="Status" value={room.status} />
        <DetailField label="Participants" value={formatCount(room.participantCount)} />
        <DetailField label="Created" value={formatTimestamp(room.createdAt)} />
      </dl>
      <fieldset aria-busy={pending} className="min-w-0">
        <legend className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Flags
        </legend>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {ROOM_FLAGS.map((flag) => {
            const enabled = room.flags.includes(flag);
            const updating = pendingFlag === flag;
            return (
              <li key={flag}>
                <label
                  className={`flex items-start gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2 ${
                    pending ? "cursor-wait" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    disabled={pending}
                    onChange={(event) => onToggleFlag(flag, event.target.checked)}
                    className="mt-0.5"
                    aria-busy={updating}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-zinc-900">
                      {FLAG_LABELS[flag]}
                    </span>
                    <span className="block font-mono text-xs text-zinc-500">
                      {updating ? `Updating ${flag}…` : flag}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
      {otherFlags.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Other flags
          </p>
          <div className="mt-1">
            <FlagChips flags={otherFlags} />
          </div>
        </div>
      ) : null}
      {flagError ? (
        <ApiError
          title="Could not update room flag"
          message={flagError.message}
          status={flagError.status}
        />
      ) : null}
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
