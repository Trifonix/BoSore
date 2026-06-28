/** Склонение «лайк / лайка / лайков» для русского UI */
export function formatLikesCount(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) return `${n} лайк`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${n} лайка`;
  }
  return `${n} лайков`;
}

export function formatLikesCountUpper(n: number): string {
  return formatLikesCount(n).toLocaleUpperCase("ru-RU");
}
