export function PageHeader({
  title,
  description,
  mock,
  baseUrl,
}: {
  title: string;
  description: string;
  mock: boolean;
  baseUrl: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">{description}</p>
        <p className="mt-1 font-mono text-xs text-zinc-400">
          {mock ? "USE_MOCK_ADMIN_API=true" : baseUrl}
        </p>
      </div>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
          mock
            ? "bg-amber-50 text-amber-800 ring-amber-600/20"
            : "bg-sky-50 text-sky-800 ring-sky-700/20"
        }`}
      >
        {mock ? "Mock data" : "Live API"}
      </span>
    </div>
  );
}
