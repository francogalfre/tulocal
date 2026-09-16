import { LocationMap } from "@/features/store/location/map";
import type { PublicPlace } from "@/features/store/location/place";

type LocationSectionProps = {
  place: PublicPlace;
};

function buildGoogleMapsUrl(place: PublicPlace): string {
  return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
}

export function LocationSection({ place }: LocationSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl">Dónde estamos</h2>
          <p className="text-sm text-muted-foreground">{place.name}</p>
        </div>
        <a
          href={buildGoogleMapsUrl(place)}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-md text-sm font-medium text-brand-deep underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Abrir en Google Maps
        </a>
      </div>
      <div className="aspect-[2/1] overflow-hidden rounded-2xl bg-secondary">
        <LocationMap
          latitude={place.latitude}
          longitude={place.longitude}
          precision="approximate"
        />
      </div>
    </section>
  );
}
