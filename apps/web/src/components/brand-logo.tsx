export function BrandLogo() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1" y="1" width="10" height="10" rx="3" fill="var(--pasto)" />
        <rect x="13" y="1" width="10" height="10" rx="3" fill="var(--pasto-deep)" />
        <rect x="1" y="13" width="10" height="10" rx="3" fill="var(--pasto-deep)" />
        <rect x="13" y="13" width="10" height="10" rx="3" fill="var(--pasto)" />
      </svg>
      <span className="font-display text-section font-semibold tracking-[-0.02em]">tutienda</span>
    </span>
  );
}
