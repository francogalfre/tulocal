"use client";

import { useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { LocationMap } from "@/features/store/location/map";
import { formatPlaceName, toPlace } from "@/features/store/location/place";
import { usePlaceSuggestions } from "@/features/store/location/suggestions";
import type { Place, PlaceSuggestion } from "@/features/store/location/place";

const SAVED_SUGGESTION_ID = "saved";

type LocationPickerProps = {
  initialPlace: Place | null;
};

function toSavedSuggestion(place: Place): PlaceSuggestion {
  return {
    id: SAVED_SUGGESTION_ID,
    name: place.addressLine,
    region: "",
    area: place.areaName,
    latitude: place.latitude,
    longitude: place.longitude,
    isAddress: place.isAddress,
  };
}

function isSameSuggestion(left: PlaceSuggestion, right: PlaceSuggestion): boolean {
  return left.id === right.id;
}

export function LocationPicker({ initialPlace }: LocationPickerProps) {
  const [selected, setSelected] = useState<PlaceSuggestion | null>(
    initialPlace === null ? null : toSavedSuggestion(initialPlace),
  );
  const [query, setQuery] = useState(initialPlace === null ? "" : initialPlace.addressLine);
  const { suggestions, isSearching } = usePlaceSuggestions(query);
  const place = selected === null ? null : toPlace(selected);

  return (
    <FieldSet>
      <FieldLegend>Ubicación</FieldLegend>
      <FieldDescription>
        Podés poner tu dirección exacta. En la tienda solo se ve el barrio y un punto aproximado.
      </FieldDescription>
      <Field>
        <FieldLabel htmlFor="location">Dirección, barrio o ciudad</FieldLabel>
        <Combobox
          items={suggestions}
          filter={null}
          value={selected}
          onValueChange={setSelected}
          inputValue={query}
          onInputValueChange={setQuery}
          itemToStringLabel={formatPlaceName}
          isItemEqualToValue={isSameSuggestion}
          autoHighlight
        >
          <ComboboxInput
            id="location"
            placeholder="Av. Santa Fe 1234, Palermo"
            autoComplete="off"
            className="h-11"
            showTrigger={false}
            showClear
          />
          <ComboboxContent>
            <ComboboxEmpty>
              {isSearching ? "Buscando" : "No encontramos ese lugar. Probá con otro nombre."}
            </ComboboxEmpty>
            <ComboboxList>
              {(suggestion: PlaceSuggestion) => (
                <ComboboxItem key={suggestion.id} value={suggestion}>
                  <span className="flex flex-col py-0.5">
                    <span>{suggestion.name}</span>
                    {suggestion.region.length > 0 ? (
                      <span className="text-xs text-muted-foreground">{suggestion.region}</span>
                    ) : null}
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
      <input type="hidden" name="addressLine" value={place === null ? "" : place.addressLine} />
      <input type="hidden" name="areaName" value={place === null ? "" : place.areaName} />
      <input type="hidden" name="latitude" value={place === null ? "" : String(place.latitude)} />
      <input type="hidden" name="longitude" value={place === null ? "" : String(place.longitude)} />
      <input type="hidden" name="isAddress" value={place === null ? "" : String(place.isAddress)} />
      {place !== null ? (
        <div className="flex flex-col gap-2">
          <div className="aspect-[2/1] overflow-hidden rounded-2xl bg-secondary">
            <LocationMap
              key={`${place.latitude},${place.longitude}`}
              latitude={place.latitude}
              longitude={place.longitude}
              precision="exact"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {place.isAddress
              ? `Los compradores van a ver "${place.areaName}" y un punto cerca, nunca esta dirección.`
              : "Los compradores van a ver este lugar tal cual."}
          </p>
        </div>
      ) : null}
    </FieldSet>
  );
}
