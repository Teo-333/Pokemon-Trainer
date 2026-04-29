import { useParams } from 'react-router-dom';

export function ListDetailsPage() {
  const { id } = useParams();

  return (
    <section>
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        List details
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Pokemon list {id}</h1>
      <p className="mt-4 text-slate-700">
        Saved list details will be added in a later step.
      </p>
    </section>
  );
}
