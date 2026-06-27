type Props = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: Props) {
  return (
    <div>
      <h1 className="dashboard-heading">Личный кабинет</h1>
      <h2 className="dashboard-subtitle">{title}</h2>
      <div className="dashboard-placeholder-box">
        <p className="dashboard-placeholder-title">Скоро…</p>
        <p className="dashboard-placeholder-text">{description}</p>
      </div>
    </div>
  );
}
