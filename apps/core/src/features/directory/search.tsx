"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";

import { tulocalIcons } from "@/components/icons";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

const SEARCH_DEBOUNCE_IN_MILLISECONDS = 300;

type DirectorySearchProps = {
  initialQuery: string;
};

function buildSearchPath(pathname: string, query: string): string {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length === 0) {
    return pathname;
  }

  return `${pathname}?${new URLSearchParams({ q: trimmedQuery }).toString()}`;
}

export function DirectorySearch({ initialQuery }: DirectorySearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, startSearch] = useTransition();
  const pendingNavigation = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelPendingNavigation(): void {
    if (pendingNavigation.current !== null) {
      clearTimeout(pendingNavigation.current);
    }
  }

  function navigate(nextQuery: string): void {
    cancelPendingNavigation();
    startSearch(() => {
      router.replace(buildSearchPath(pathname, nextQuery), { scroll: false });
    });
  }

  function handleChange(nextQuery: string): void {
    setQuery(nextQuery);
    cancelPendingNavigation();
    pendingNavigation.current = setTimeout(
      () => navigate(nextQuery),
      SEARCH_DEBOUNCE_IN_MILLISECONDS,
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    navigate(query);
  }

  return (
    <form role="search" action={pathname} onSubmit={handleSubmit}>
      <InputGroup className="h-12 rounded-xl bg-background">
        <InputGroupAddon>
          {isSearching ? <Spinner /> : <tulocalIcons.search aria-hidden="true" />}
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          name="q"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Buscá tiendas o productos, por ejemplo plantas"
          aria-label="Buscar tiendas o productos"
          autoComplete="off"
          enterKeyHint="search"
          className="text-base"
        />
      </InputGroup>
    </form>
  );
}
