import { SidebarNav } from "@/components/sidebar-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="flex w-full shrink-0 flex-col bg-zinc-950 text-zinc-100 md:sticky md:top-0 md:h-screen md:w-60">
        <div className="flex h-14 items-center border-b border-white/10 px-4">
          <span className="text-sm font-semibold tracking-tight">Kula Party</span>
        </div>
        <SidebarNav />
        <p className="mt-auto hidden border-t border-white/10 px-4 py-3 text-xs text-zinc-500 md:block">
          Read-only v1
        </p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
          <p className="text-sm font-semibold tracking-tight text-zinc-900">
            Kula Party Admin
          </p>
          <p className="text-sm text-zinc-600">
            Signed in as{" "}
            <span className="font-medium text-zinc-900">Admin</span>
          </p>
        </header>
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
