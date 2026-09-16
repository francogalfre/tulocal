type LogoProps = {
  wordmark?: boolean;
};

export function Logo({ wordmark = true }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2 font-display text-xl font-semibold">
      <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5">
        <rect x="0" y="0" width="9" height="9" rx="2.5" className="fill-accent" />
        <rect x="11" y="0" width="9" height="9" rx="2.5" className="fill-deep" />
        <rect x="0" y="11" width="9" height="9" rx="2.5" className="fill-deep" />
        <rect x="11" y="11" width="9" height="9" rx="2.5" className="fill-accent" />
      </svg>
      {wordmark ? "tulocal" : null}
    </span>
  );
}
