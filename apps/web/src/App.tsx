import { useEffect, useState } from 'react';

type HealthState = 'checking' | 'available' | 'unavailable';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export function App() {
  const [healthState, setHealthState] = useState<HealthState>('checking');

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${apiUrl}/health`, { signal: controller.signal })
      .then((response) => {
        setHealthState(response.ok ? 'available' : 'unavailable');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setHealthState('unavailable');
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Pokemon Collections
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Project skeleton</h1>
        <p className="mt-4 text-base text-slate-700">
          The frontend is running. API status: <strong>{healthState}</strong>.
        </p>
      </section>
    </main>
  );
}
