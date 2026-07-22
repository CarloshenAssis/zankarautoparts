export function BrandMark({
  variant = "compact",
  size = "md",
  hideTextOnMobile = false,
  className = "",
  logoUrl,
}: {
  variant?: "compact" | "stacked";
  size?: keyof typeof SIZES;
  hideTextOnMobile?: boolean;
  className?: string;
  logoUrl?: string;
}) {
  const wordmark = (
    <span
      className={`font-display font-black tracking-wide`}
      style={{ fontSize: getFontSize(size) }}
    >
      ZAN
      <span className="text-primary">K</span>
      AR
    </span>
  );

  if (logoUrl) {
    const logoHeight = { sm: "32px", md: "44px", lg: "64px" }[size];
    if (variant === "stacked") {
      return (
        <div className={`flex flex-col items-center text-center ${className}`}>
          <img src={logoUrl} alt="Logo" style={{ height: logoHeight }} className="object-contain" />
        </div>
      );
    }
    return (
      <div className={`flex shrink-0 items-center gap-2 ${className}`}>
        <img
          src={logoUrl}
          alt="Logo"
          style={{ height: logoHeight }}
          className={`object-contain ${hideTextOnMobile ? "hidden sm:block" : ""}`}
        />
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="leading-none">{wordmark}</div>
      </div>
    );
  }

  return (
    <div className={`flex shrink-0 items-center gap-2 ${className}`}>
      <div className={`leading-none ${hideTextOnMobile ? "hidden sm:block" : ""}`}>{wordmark}</div>
    </div>
  );
}

const SIZES = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
} as const;

function getFontSize(size: keyof typeof SIZES): string {
  const sizes = { sm: "18px", md: "24px", lg: "36px" };
  return sizes[size];
}
