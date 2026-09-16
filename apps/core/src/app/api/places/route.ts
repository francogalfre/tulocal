import type { NextRequest } from "next/server";

import { searchPlaces } from "@/features/store/location/search";

const MIN_QUERY_LENGTH = 2;

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  if (query.trim().length < MIN_QUERY_LENGTH) {
    return Response.json([]);
  }

  const suggestions = await searchPlaces(query.trim());

  return Response.json(suggestions);
}
