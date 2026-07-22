const SIZES = {
  sm: { box: "h-9 w-9", icon: "h-5 w-5", word: "text-lg", kSize: "h-7 w-5", dash: 10 },
  md: { box: "h-11 w-11", icon: "h-6 w-6", word: "text-2xl", kSize: "h-8 w-6", dash: 12 },
  lg: { box: "h-16 w-16", icon: "h-9 w-9", word: "text-4xl", kSize: "h-12 w-8", dash: 16 },
} as const;

export function BrandMark({
  variant = "compact",
  size = "md",
  hideTextOnMobile = false,
  className = "",
}: {
  variant?: "compact" | "stacked";
  size?: keyof typeof SIZES;
  hideTextOnMobile?: boolean;
  className?: string;
}) {
  const s = SIZES[size];

  const KLightning = () => (
    <svg viewBox="0 0 32 40" fill="none" className={`${s.kSize} inline-block align-text-top`} aria-hidden="true">
      <path
        d="M 18 2 L 8 16 L 16 16 L 6 38 L 20 18 L 14 18 Z"
        fill="url(#kGradient)"
        stroke="#6c2bd9"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="kGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6c2bd9" />
          <stop offset="100%" stopColor="#4b1e78" />
        </linearGradient>
      </defs>
    </svg>
  );

  const wordmark = (
    <span className={`font-display ${s.word} font-black tracking-wide inline-flex items-baseline`}>
      ZAN
      <KLightning />
      AR
    </span>
  );

  const tagline = (
    <span className="mt-1 flex items-center gap-2 text-primary">
      <span className={`h-px bg-primary/60`} style={{ width: `${s.dash}px` }} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.35em]">Auto Parts</span>
      <span className={`h-px bg-primary/60`} style={{ width: `${s.dash}px` }} />
    </span>
  );

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <CarSilhouette className="w-32 text-foreground" />
        <div className="mt-1 leading-none">{wordmark}</div>
        {tagline}
      </div>
    );
  }

  return (
    <div className={`flex shrink-0 items-center gap-2 ${className}`}>
      <div
        className={`grid ${s.box} shrink-0 place-items-center rounded-md bg-gradient-red shadow-red`}
      >
        <CarSilhouette className={`${s.icon} text-primary-foreground`} />
      </div>
      <div className={`leading-none ${hideTextOnMobile ? "hidden sm:block" : ""}`}>
        {wordmark}
        {size !== "sm" && tagline}
      </div>
    </div>
  );
}

export function CarSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 34" fill="none" className={className} aria-hidden="true">
      <path
        d="M2 27 C 12 27 17 15 28 11 C 37 8 42 7 50 6.5 C 60 6 64 11 72 11 C 82 11 87 16 97 18.5 C 105 20.5 111 22 118 23.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
