type Props = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-1 text-lg text-muted-foreground">{title}</h2>
      <div className="mt-8 rounded-xl border border-dashed bg-muted/30 px-6 py-16 text-center">
        <p className="text-lg font-medium text-slate-700">Скоро…</p>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
