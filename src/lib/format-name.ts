export function formatDisplayName(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1].charAt(0)}.`;
    }
    return parts[0];
  }
  if (email) {
    return email.split("@")[0];
  }
  return "Пользователь";
}
