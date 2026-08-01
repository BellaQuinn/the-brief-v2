// Trigger rule for the boot sequence, kept separate from the component so
// the rule itself can change later (inactivity-based, a Settings toggle)
// without touching how the sequence is rendered.
//
// v1: once per calendar day. localStorage (not sessionStorage) so it
// survives new tabs and dev-server restarts — it won't fire on every
// refresh during development either.

const STORAGE_KEY = "brief:boot-sequence:last-shown";

export function shouldShowBootSequence(now: Date = new Date()): boolean {
  if (typeof window === "undefined") return false;
  const last = window.localStorage.getItem(STORAGE_KEY);
  if (!last) return true;
  const lastShown = new Date(last);
  if (Number.isNaN(lastShown.getTime())) return true;
  return lastShown.toDateString() !== now.toDateString();
}

export function markBootSequenceShown(now: Date = new Date()): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, now.toISOString());
}
