import { createHash } from "node:crypto";

import { z } from "zod";

import { serverEnvironment } from "@tulocal/environment/server";
import { rememberCache } from "@tulocal/storage/cache";
import type { CacheEntry } from "@tulocal/storage/cache";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

const TAVILY_MAX_RESULTS = 10;

const SEARCH_CACHE_PREFIX = "web-search";

const SEARCH_CACHE_TIME_TO_LIVE_IN_SECONDS = 60 * 60 * 24;

const TAVILY_CHUNKS_PER_SOURCE = 3;

const searchResultSchema = z.object({ title: z.string(), url: z.url(), content: z.string() });

const tavilyResponseSchema = z.object({ results: z.array(searchResultSchema) });

const cachedResultsSchema = z.array(searchResultSchema);

export type SearchInput = {
  query: string;
  includeDomains: string[] | null;
  country: string | null;
};

export type SearchResult = z.infer<typeof searchResultSchema>;

type TavilySearchBody = {
  query: string;
  max_results: number;
  search_depth: "advanced";
  chunks_per_source: number;
  include_domains?: string[];
  country?: string;
};

function buildSearchBody(input: SearchInput): string {
  const body: TavilySearchBody = {
    query: input.query,
    max_results: TAVILY_MAX_RESULTS,
    search_depth: "advanced",
    chunks_per_source: TAVILY_CHUNKS_PER_SOURCE,
  };

  if (input.includeDomains !== null) {
    body.include_domains = input.includeDomains;
  }

  if (input.country !== null) {
    body.country = input.country;
  }

  return JSON.stringify(body);
}

function buildSearchCacheEntry(body: string): CacheEntry<SearchResult[]> {
  const digest = createHash("sha256").update(body).digest("hex");

  return {
    key: `${SEARCH_CACHE_PREFIX}:${digest}`,
    schema: cachedResultsSchema,
    timeToLiveInSeconds: SEARCH_CACHE_TIME_TO_LIVE_IN_SECONDS,
  };
}

async function fetchResults(body: string): Promise<SearchResult[]> {
  const response = await fetch(TAVILY_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serverEnvironment.TAVILY_API_KEY}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Tavily responded ${response.status}`);
  }

  return tavilyResponseSchema.parse(await response.json()).results;
}

export async function searchWeb(input: SearchInput): Promise<SearchResult[]> {
  const body = buildSearchBody(input);

  return rememberCache(buildSearchCacheEntry(body), () => fetchResults(body));
}
