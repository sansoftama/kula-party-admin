import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Page not found</h1>
      <p className="mt-1 text-sm text-zinc-500">That admin page is not part of this version.</p>
      <Link href="/" className="mt-4 inline-block text-sm font-medium text-zinc-900 underline">
        Back to health
      </Link>
    </div>
  );
}
