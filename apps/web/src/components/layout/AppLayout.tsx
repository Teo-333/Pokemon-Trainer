import { Link } from 'react-router-dom';

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link className="text-lg font-semibold" to="/">
            Pokemon Collections
          </Link>
          <Link
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            to="/lists/new"
          >
            Create New List
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
