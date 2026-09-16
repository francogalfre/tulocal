import { tulocalIcons } from "@/components/icons";
import { InView } from "@/components/motion/inview";

const AUTHORS = [
  { name: "Franco", href: "https://x.com/francogalfredev" },
  { name: "Valentín", href: "https://x.com/galfrevn" },
];

export function Footer() {
  return (
    <InView
      as="footer"
      className="flex flex-col gap-6 border-t px-6 pt-8 pb-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
    >
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
              <tulocalIcons.xLogo className="size-3.5" aria-hidden="true" />
              {author.name}
            </a>
            {index < AUTHORS.length - 1 && <span>y</span>}
          </span>
        ))}
      </p>
    </InView>
  );
}
