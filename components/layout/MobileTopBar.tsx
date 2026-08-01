export function MobileTopBar({ right }: { right?: React.ReactNode }) {
  return (
    <div className="workspace-header-treatment flex items-center justify-between border-b border-border-subtle px-4 py-3 md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-seal/40 text-seal">
          <span className="font-display text-[10px] font-semibold">B</span>
        </div>
        <p className="font-display text-sm font-medium text-ink-primary">The Brief</p>
      </div>
      {right}
    </div>
  );
}
