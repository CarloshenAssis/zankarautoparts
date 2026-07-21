const SIZES = {
  sm: { box: "h-9 w-9", icon: "h-5 w-5", word: "text-lg", dash: "w-2.5" },
  md: { box: "h-11 w-11", icon: "h-6 w-6", word: "text-2xl", dash: "w-3" },
  lg: { box: "h-16 w-16", icon: "h-9 w-9", word: "text-4xl", dash: "w-4" },
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

  const wordmark = (
    <span className={`font-display ${s.word} font-black tracking-wide`}>
      ZAN
      <span className="bg-gradient-red bg-clip-text text-transparent">K</span>
      AR
    </span>
  );

  const tagline = (
    <span className="mt-1 flex items-center gap-2 text-primary">
      <span className={`h-px ${s.dash} bg-primary/60`} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.35em]">Auto Parts</span>
      <span className={`h-px ${s.dash} bg-primary/60`} />
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
