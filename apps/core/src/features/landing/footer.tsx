function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-3.5">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

const AUTHORS = [
  { name: "Franco", href: "https://x.com/francogalfredev" },
  { name: "Valentín", href: "https://x.com/galfrevn" },
];

export function Footer() {
  return (
    <footer className="flex flex-col gap-6 border-t px-6 pt-8 pb-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <span className="font-heading text-base font-semibold text-foreground">tulocal</span>
        <span>La tienda que se vende sola.</span>
      </div>
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 sm:justify-end">
        <span>Hecho en Argentina por</span>
        {AUTHORS.map((author, index) => (
          <span key={author.href} className="flex items-center gap-1.5">
            <a
              href={author.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <XIcon />
              {author.name}
            </a>
            {index < AUTHORS.length - 1 && <span>y</span>}
          </span>
        ))}
      </p>
    </footer>
  );
}
