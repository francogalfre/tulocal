import type { MetadataRoute } from "next";

import { appOrigin } from "@/lib/origin";

const DISALLOWED_PATHS = ["/api/", "/admin", "/store/", "/new", "/metrics", "/plans"];

const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOWED_PATHS },
      { userAgent: AI_CRAWLER_USER_AGENTS, allow: "/", disallow: DISALLOWED_PATHS },
    ],
    sitemap: `${appOrigin}/sitemap.xml`,
    host: appOrigin,
  };
}
