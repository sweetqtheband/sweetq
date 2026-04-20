"use client";

import { useEffect, useRef } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

let optionsSet = false;

export default function GooglePlacesLoader({ apiKey }: { apiKey: string }) {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const loadGooglePlaces = async () => {
      try {
        if (!optionsSet) {
          setOptions({ key: apiKey });
          optionsSet = true;
        }
        await importLibrary("places");
      } catch (error) {
        console.error("Failed to load Google Places library:", error);
      }
    };

    loadGooglePlaces();
  }, [apiKey]);

  return null;
}
