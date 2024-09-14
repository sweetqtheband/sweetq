"use client";

import { CountryFilter, StateFilter, CityFilter } from "@/app/components/filters";
import { FilterContext } from "@/app/context";
import { useState} from "react";


export default function PageFilters({
  countryId = -1,
  stateId = -1,
  cityId = -1,
}:Readonly<{
  countryId?: string | number;
  stateId?: string | number;
  cityId?: string | number;
}>) {   
  
  const [filterState, setFilterState] = useState({open: true, field: ''})
  
  const onChange = (filterState:{open:boolean,field:string}) => {
    setFilterState(filterState);
  }

  return (
    <FilterContext.Provider value={filterState}>
      <CountryFilter
        selected={countryId}
        onChange={onChange}
        removable={true}
        isFilter={true}
      />
      <StateFilter
        disabled={!countryId}
        selectedCountry={countryId}
        selected={stateId}
        onChange={onChange}
        removable={true}
        isFilter={true}
      />
      <CityFilter
        disabled={stateId === -1}
        selectedState={stateId}
        selected={cityId}
        onChange={onChange}
        removable={true}
        isFilter={true}
      />
    </FilterContext.Provider>
  );
};