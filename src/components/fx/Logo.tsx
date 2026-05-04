export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a78bfa" />
            <stop offset="0.5" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        <path
          d="M4 4h7a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H8v6H4V4Z"
          fill="url(#lg)"
        />
        <circle cx="18" cy="18" r="3" fill="url(#lg)" />
      </svg>
      <span className="text-[1.05rem]">Plinth</span>
    </span>
  );
}
