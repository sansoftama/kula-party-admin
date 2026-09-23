export function ApiError({
  message,
  status,
}: {
  message: string;
  status?: number;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <p className="font-medium">Could not load admin data</p>
      <p className="mt-1">
        {status ? `HTTP ${status}. ` : ""}
        {message}
      </p>
    </div>
  );
}
