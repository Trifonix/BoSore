export function formatDbError(error: unknown): string {
  const raw =
    error instanceof Error ? error.message : "Неизвестная ошибка подключения";

  const firstLine = raw.split("\n").find((line) => line.trim()) ?? raw;

  if (firstLine.includes("Can't reach database server")) {
    return `${firstLine}\n\nNeon мог «уснуть» после простоя. Откройте проект в console.neon.tech и нажмите «Подключиться» ещё раз через 5–10 секунд.`;
  }

  if (firstLine.includes("Строка подключения")) {
    return firstLine;
  }

  return firstLine;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
