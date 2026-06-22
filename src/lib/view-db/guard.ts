export function isViewDbEnabled(): boolean {
  return (
    process.env.VIEW_DB_ENABLED === "1" ||
    process.env.NODE_ENV === "development"
  );
}
