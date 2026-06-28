"use client";

type Props = {
  visible: boolean;
  label?: string;
};

export function PageLoadingOverlay({
  visible,
  label = "Данные загружаются…",
}: Props) {
  return (
    <div
      className={`page-loading-overlay${visible ? " is-visible" : ""}`}
      aria-hidden={!visible}
      aria-live="polite"
      aria-busy={visible}
    >
      <div className="page-loading-spinner" role="status">
        <span className="page-loading-ring page-loading-ring-outer" />
        <span className="page-loading-ring page-loading-ring-inner" />
        <span className="page-loading-core" />
      </div>
      <p className="page-loading-label">{label}</p>
    </div>
  );
}
