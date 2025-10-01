export function classNames(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

export function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isAllZeroMap(m: Record<string, number>) {
  const vals = Object.values(m ?? {});
  return vals.length === 0 || vals.every((v) => v === 0);
}
export function isAllZeroBars(arr: { label: string; value: number }[]) {
  return arr.length === 0 || arr.every((b) => !b.value);
}
