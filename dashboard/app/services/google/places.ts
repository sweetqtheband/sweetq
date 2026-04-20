interface CustomWindow extends Window {
  google: any;
}

const initializeGooglePlaces = () => {
  if (typeof window === "undefined") {
    return;
  }

  const win = window as unknown as CustomWindow;

  if (!win.google || !win.google.maps || !win.google.maps.places) {
    console.error("Google Places API is not loaded.");
    return;
  }

  return win.google.maps.places;
};

const search = async (params: { address: string; country?: string; state?: string }) => {
  const { Place } = await initializeGooglePlaces();

  const textQuery = `${params.address}${params.state ? `, ${params.state}` : ""}${
    params.country ? `, ${params.country}` : ""
  }`;

  console.log("TEXTQUERY", params.state, params.country, textQuery);

  const request = {
    textQuery,
    fields: ["formattedAddress"],
    includedType: "",
    useStrictTypeFiltering: true,
    maxResultCount: 8,
    minRating: 1,
    region: "es",
  };
  const { places } = await Place.searchByText(request);
  return places?.[0]?.formattedAddress || null;
};

const getEmbedURI = async (params: { address: string; country?: string; state?: string }) => {
  return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_EMBED_MAPS_API_KEY}&q=${encodeURIComponent(
    params.address
  )}${params.state ? `,${encodeURIComponent(params.state)}` : ""}${
    params.country ? `,${encodeURIComponent(params.country)}` : ""
  }`;
};

export const GooglePlace = {
  search,
  getEmbedURI,
};
