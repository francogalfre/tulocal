import Link from "next/link";

type LogoProps = {
  wordmark?: boolean;
  href?: string;
};

export function Logo({ wordmark = true, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md font-heading text-xl font-semibold tracking-[-0.02em] outline-none transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5">
        <rect x="0" y="0" width="9" height="9" rx="2.5" className="fill-brand" />
        <rect x="11" y="0" width="9" height="9" rx="2.5" className="fill-brand-deep" />
        <rect x="0" y="11" width="9" height="9" rx="2.5" className="fill-brand-deep" />
        <rect x="11" y="11" width="9" height="9" rx="2.5" className="fill-brand" />
      </svg>
      {wordmark ? <span>tulocal</span> : <span className="sr-only">tulocal</span>}
    </Link>
  );
}
