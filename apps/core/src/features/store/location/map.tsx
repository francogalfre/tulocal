"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { Map as MapCanvas, Marker } from "@vis.gl/react-maplibre";

const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

const EXACT_ZOOM = 15;

const APPROXIMATE_ZOOM = 14;

type MapLibrary = typeof import("maplibre-gl");

type LocationPrecision = "exact" | "approximate";

type LocationMapProps = {
  latitude: number;
  longitude: number;
  precision: LocationPrecision;
};

function buildWorkerUrl(version: string): string {
  return `https://cdn.jsdelivr.net/npm/maplibre-gl@${version}/dist/maplibre-gl-worker.mjs`;
}

async function loadMapLibrary(): Promise<MapLibrary> {
  const library = await import("maplibre-gl");
  library.setWorkerUrl(buildWorkerUrl(library.getVersion()));

  return library;
}

export function LocationMap({ latitude, longitude, precision }: LocationMapProps) {
  const isExact = precision === "exact";

  return (
    <MapCanvas
      mapLib={loadMapLibrary()}
      mapStyle={MAP_STYLE_URL}
      initialViewState={{ latitude, longitude, zoom: isExact ? EXACT_ZOOM : APPROXIMATE_ZOOM }}
      interactive={false}
      attributionControl={{ compact: true }}
    >
      <Marker latitude={latitude} longitude={longitude} anchor="center">
        {isExact ? (
          <span className="block size-4 rounded-full border-2 border-background bg-brand-deep ring-8 ring-brand/25" />
        ) : (
          <span className="block size-24 rounded-full border-2 border-brand/50 bg-brand/15" />
        )}
      </Marker>
    </MapCanvas>
  );
}
