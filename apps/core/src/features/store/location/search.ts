import { z } from "zod";

import type { PlaceSuggestion } from "@/features/store/location/place";

const PHOTON_ENDPOINT = "https://photon.komoot.io/api/";

const ARGENTINA_BOUNDING_BOX = "-73.6,-55.1,-53.6,-21.8";

const PLACE_LAYERS = ["house", "street", "locality", "district", "city", "county"];

const ADDRESS_TYPES = new Set(["house", "street"]);

const MAX_SUGGESTIONS = 6;

const REGION_ABBREVIATIONS: Record<string, string> = {
  "Ciudad Autónoma de Buenos Aires": "CABA",
};

const photonFeatureSchema = z.object({
  properties: z.object({
    osm_type: z.string(),
    osm_id: z.number(),
    type: z.string(),
    name: z.string().optional(),
    street: z.string().optional(),
    housenumber: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }),
  geometry: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
  }),
});

const photonResponseSchema = z.object({
  features: z.array(photonFeatureSchema),
});

type PhotonFeature = z.infer<typeof photonFeatureSchema>;

type PhotonProperties = PhotonFeature["properties"];

type DescribedPlace = Pick<PlaceSuggestion, "name" | "region" | "area" | "isAddress">;

function abbreviateRegion(region: string): string {
  return REGION_ABBREVIATIONS[region] ?? region;
}

function joinDistinct(parts: (string | undefined)[]): string {
  const distinct = new Set(
    parts.flatMap((part) => (part === undefined ? [] : [abbreviateRegion(part)])),
  );

  return Array.from(distinct).join(", ");
}

function readStreetLine(properties: PhotonProperties): string | undefined {
  if (properties.street === undefined) {
    return undefined;
  }

  return [properties.street, properties.housenumber].filter(Boolean).join(" ");
}

function describeAddress(properties: PhotonProperties): DescribedPlace | null {
  const streetLine = readStreetLine(properties);
  const name = properties.name ?? streetLine;

  if (name === undefined) {
    return null;
  }

  const regionParts = [
    name === streetLine ? undefined : streetLine,
    properties.district,
    properties.city,
    properties.state,
  ];

  return {
    name,
    region: joinDistinct(regionParts),
    area: joinDistinct([properties.district, properties.city, properties.state]),
    isAddress: true,
  };
}

function describePlace(properties: PhotonProperties): DescribedPlace | null {
  if (properties.name === undefined) {
    return null;
  }

  const regionParts = [properties.city, properties.state].filter(
    (part) => part !== properties.name,
  );
  const region = joinDistinct(regionParts);

  return {
    name: properties.name,
    region,
    area: region.length === 0 ? properties.name : `${properties.name}, ${region}`,
    isAddress: false,
  };
}

function toSuggestion(feature: PhotonFeature): PlaceSuggestion | null {
  const described = ADDRESS_TYPES.has(feature.properties.type)
    ? describeAddress(feature.properties)
    : describePlace(feature.properties);

  if (described === null) {
    return null;
  }

  const [longitude, latitude] = feature.geometry.coordinates;

  return {
    ...described,
    id: `${feature.properties.osm_type}${feature.properties.osm_id}`,
    latitude,
    longitude,
  };
}

function buildSearchUrl(query: string): string {
  const url = new URL(PHOTON_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(MAX_SUGGESTIONS));
  url.searchParams.set("bbox", ARGENTINA_BOUNDING_BOX);
  for (const layer of PLACE_LAYERS) {
    url.searchParams.append("layer", layer);
  }

  return url.toString();
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const response = await fetch(buildSearchUrl(query));

  if (!response.ok) {
    throw new Error(`Photon search failed with status ${response.status}`);
  }

  const parsed = photonResponseSchema.parse(await response.json());

  return parsed.features.flatMap((feature) => {
    const suggestion = toSuggestion(feature);

    return suggestion === null ? [] : [suggestion];
  });
}
