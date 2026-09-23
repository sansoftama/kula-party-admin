"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1">{error.message || "The page failed to render."}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-3 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm text-red-800 hover:bg-red-100"
      >
        Try again
      </button>
    </div>
  );
}
