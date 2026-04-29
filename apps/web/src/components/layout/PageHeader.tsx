type PageHeaderProps = {
  eyebrow: string;
  title: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
