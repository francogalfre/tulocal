import { z } from "zod";

const ADDRESS_LINE_MAX_LENGTH = 200;

const AREA_NAME_MAX_LENGTH = 120;

const MIN_LATITUDE = -90;

const MAX_LATITUDE = 90;

const MIN_LONGITUDE = -180;

const MAX_LONGITUDE = 180;

const latitudeSchema = z.number().min(MIN_LATITUDE).max(MAX_LATITUDE);

const longitudeSchema = z.number().min(MIN_LONGITUDE).max(MAX_LONGITUDE);

export const placeSuggestionSchema = z.object({
  id: z.string(),
  name: z.string(),
  region: z.string(),
  area: z.string(),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  isAddress: z.boolean(),
});

export const placeSuggestionsSchema = z.array(placeSuggestionSchema);

export type PlaceSuggestion = z.infer<typeof placeSuggestionSchema>;

export type Place = {
  addressLine: string;
  areaName: string;
  latitude: number;
  longitude: number;
  isAddress: boolean;
};

export type PublicPlace = {
  name: string;
  latitude: number;
  longitude: number;
};

export type PublicPlaceColumns = {
  locationName: string | null;
  locationLatitude: number | null;
  locationLongitude: number | null;
};

export type StoredPlaceColumns = PublicPlaceColumns & {
  addressLine: string | null;
  addressLatitude: number | null;
  addressLongitude: number | null;
};

const emptyPlaceFormSchema = z
  .object({
    addressLine: z.literal(""),
    areaName: z.literal(""),
    latitude: z.literal(""),
    longitude: z.literal(""),
    isAddress: z.literal(""),
  })
  .transform((): Place | null => null);

const filledPlaceFormSchema = z
  .object({
    addressLine: z.string().trim().min(1).max(ADDRESS_LINE_MAX_LENGTH),
    areaName: z.string().trim().min(1).max(AREA_NAME_MAX_LENGTH),
    latitude: z.coerce.number().pipe(latitudeSchema),
    longitude: z.coerce.number().pipe(longitudeSchema),
    isAddress: z.enum(["true", "false"]).transform((flag) => flag === "true"),
  })
  .transform((fields): Place => fields);

export const placeFormSchema = z.union([emptyPlaceFormSchema, filledPlaceFormSchema]);

export function formatPlaceName(suggestion: PlaceSuggestion): string {
  return suggestion.region.length === 0
    ? suggestion.name
    : `${suggestion.name}, ${suggestion.region}`;
}

export function toPlace(suggestion: PlaceSuggestion): Place {
  return {
    addressLine: formatPlaceName(suggestion),
    areaName: suggestion.area,
    latitude: suggestion.latitude,
    longitude: suggestion.longitude,
    isAddress: suggestion.isAddress,
  };
}

export function readPublicPlace(columns: PublicPlaceColumns): PublicPlace | null {
  if (
    columns.locationName === null ||
    columns.locationLatitude === null ||
    columns.locationLongitude === null
  ) {
    return null;
  }

  return {
    name: columns.locationName,
    latitude: columns.locationLatitude,
    longitude: columns.locationLongitude,
  };
}

export function readStoredPlace(columns: StoredPlaceColumns): Place | null {
  const publicPlace = readPublicPlace(columns);

  if (publicPlace === null) {
    return null;
  }

  if (
    columns.addressLine === null ||
    columns.addressLatitude === null ||
    columns.addressLongitude === null
  ) {
    return {
      addressLine: publicPlace.name,
      areaName: publicPlace.name,
      latitude: publicPlace.latitude,
      longitude: publicPlace.longitude,
      isAddress: false,
    };
  }

  return {
    addressLine: columns.addressLine,
    areaName: publicPlace.name,
    latitude: columns.addressLatitude,
    longitude: columns.addressLongitude,
    isAddress: true,
  };
}
