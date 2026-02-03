import { useAuth } from "../auth/AuthProvider.jsx";

export default function AppShell({ title, children }) {
  const { isAuthenticated, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">EMS</span>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Log out
              </button>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
