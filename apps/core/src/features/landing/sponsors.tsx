import Image from "next/image";

import { Marquee } from "@/components/marquee";

function V0Logo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d="M14.252 8.25h5.624c.088 0 .176.006.26.018l-5.87 5.87a1.889 1.889 0 01-.019-.265V8.25h-2.25v5.623a4.124 4.124 0 004.125 4.125h5.624v-2.25h-5.624c-.09 0-.179-.006-.265-.018l5.874-5.875a1.9 1.9 0 01.02.27v5.623H24v-5.624A4.124 4.124 0 0019.876 6h-5.624v2.25zM0 7.5v.006l7.686 9.788c.924 1.176 2.813.523 2.813-.973V7.5H8.25v6.87L2.856 7.5H0z" />
    </svg>
  );
}

export function Sponsors() {
  return (
    <section className="flex flex-col gap-6 border-t px-6 py-12">
      <p className="text-center text-sm text-muted-foreground">Con el apoyo de</p>
      <Marquee
        aria-hidden="true"
        pauseOnHover
        className="[--duration:30s] [--gap:3rem] mask-[linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
      >
        <span className="text-muted-foreground">
          <V0Logo />
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Image
            src="/landing/remolitoral.svg"
            alt=""
            width={224}
            height={224}
            className="h-6 w-6"
          />
          <span className="font-heading text-lg font-semibold whitespace-nowrap">Remo Litoral</span>
        </span>
      </Marquee>
      <p className="sr-only">v0, Remo Litoral</p>
    </section>
  );
}
