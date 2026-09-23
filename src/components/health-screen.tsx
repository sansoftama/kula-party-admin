import { ApiError } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import { getAdminHealth } from "@/lib/admin-api";
import { formatTimestamp } from "@/lib/format";

export async function HealthScreen() {
  const result = await getAdminHealth();

  return (
    <section>
      <PageHeader
        title="Platform health"
        description="Status from GET /v1/admin/health on kula-party-backend."
        mock={result.mock}
        baseUrl={result.baseUrl}
      />
      {result.ok ? <HealthBody data={result.data} /> : <ApiError message={result.message} status={result.status} />}
    </section>
  );
}

function HealthBody({
  data,
}: {
  data: {
    ok: boolean;
    service: string;
    version?: string;
    time: string;
    checks?: Record<string, "up" | "down">;
  };
}) {
  const checks = Object.entries(data.checks ?? {});

  return (
    <div className="space-y-4">
      <div
        className={`rounded-lg border px-4 py-3 ${
          data.ok
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-red-200 bg-red-50 text-red-900"
        }`}
      >
        <p className="text-sm font-medium">{data.ok ? "Healthy" : "Unhealthy"}</p>
        <p className="mt-1 text-sm">{data.service}</p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <Info label="Service" value={data.service} />
        <Info label="Version" value={data.version ?? "—"} />
        <Info label="Time" value={formatTimestamp(data.time)} />
      </dl>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h2 className="text-sm font-medium text-zinc-900">Checks</h2>
        </div>
        {checks.length === 0 ? (
          <p className="px-4 py-6 text-sm text-zinc-500">No dependency checks reported.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {checks.map(([name, status]) => (
              <li key={name} className="flex items-center justify-between px-4 py-3">
                <span className="font-mono text-sm text-zinc-800">{name}</span>
                <StatusPill status={status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-1 break-all text-sm text-zinc-900">{value}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: "up" | "down" }) {
  const up = status === "up";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        up
          ? "bg-emerald-50 text-emerald-800 ring-emerald-600/20"
          : "bg-red-50 text-red-800 ring-red-600/20"
      }`}
    >
      {status}
    </span>
  );
}
