import { useEffect, useState } from "react";

import { placeSuggestionsSchema } from "@/features/store/location/place";
import type { PlaceSuggestion } from "@/features/store/location/place";

const SEARCH_DEBOUNCE_IN_MILLISECONDS = 300;

const MIN_QUERY_LENGTH = 2;

type PlaceSuggestions = {
  suggestions: PlaceSuggestion[];
  isSearching: boolean;
};

async function fetchSuggestions(query: string, signal: AbortSignal): Promise<PlaceSuggestion[]> {
  const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`, { signal });

  if (!response.ok) {
    throw new Error(`Place search failed with status ${response.status}`);
  }

  return placeSuggestionsSchema.parse(await response.json());
}

export function usePlaceSuggestions(query: string): PlaceSuggestions {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    const timeout = setTimeout(() => {
      fetchSuggestions(trimmedQuery, controller.signal)
        .then((found) => {
          setSuggestions(found);
          setIsSearching(false);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }

          setSuggestions([]);
          setIsSearching(false);
          throw error;
        });
    }, SEARCH_DEBOUNCE_IN_MILLISECONDS);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [trimmedQuery]);

  return { suggestions, isSearching };
}
