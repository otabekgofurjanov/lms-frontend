export const formatDurationMmSs = (seconds: number): string => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const restSeconds = Math.floor(safeSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${restSeconds}`;
};
