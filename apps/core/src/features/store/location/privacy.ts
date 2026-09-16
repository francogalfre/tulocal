import type { Place, PublicPlace } from "@/features/store/location/place";

const PUBLIC_GRID_STEP_IN_DEGREES = 0.005;

function snapToGridCenter(coordinate: number): number {
  const cellIndex = Math.floor(coordinate / PUBLIC_GRID_STEP_IN_DEGREES);

  return (cellIndex + 0.5) * PUBLIC_GRID_STEP_IN_DEGREES;
}

export function derivePublicPlace(place: Place): PublicPlace {
  if (!place.isAddress) {
    return { name: place.areaName, latitude: place.latitude, longitude: place.longitude };
  }

  return {
    name: place.areaName,
    latitude: snapToGridCenter(place.latitude),
    longitude: snapToGridCenter(place.longitude),
  };
}
