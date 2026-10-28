export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-fill text-white shadow-lazy">
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden>
          <rect x="4" y="16" width="24" height="10" rx="4" fill="currentColor" opacity="0.35" />
          <path d="M6 18c4-8 16-8 20 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20" cy="11" r="2" fill="#E2B04A" />
        </svg>
      </span>
      <span className="min-w-0 leading-tight">
        <span className="display block truncate text-lg font-semibold tracking-tight">LazyFit AI</span>
        <span className="hidden text-[11px] uppercase tracking-[0.18em] text-muted sm:block">тренер для дивана</span>
      </span>
    </div>
  );
}
